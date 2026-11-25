package com.myfirstapp

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat

object AlarmNotificationHelper {
    const val LONE_WORKER_CHANNEL_ID = "priority_lone_worker_channel"
    const val EMERGENCY_DISPATCH_CHANNEL_ID = "priority_emergency_dispatch_channel"
    
    const val LONE_WORKER_NOTIFICATION_ID = 9001
    const val EMERGENCY_DISPATCH_NOTIFICATION_ID = 9002

    private var mediaPlayer: MediaPlayer? = null
    private var activeRingtone: Ringtone? = null
    private var screenWakeLock: PowerManager.WakeLock? = null
    private var cpuWakeLock: PowerManager.WakeLock? = null
    private var isPlayingAlarm = false

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()

            val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

            // 1. Lone Worker Channel
            val loneWorkerChannel = NotificationChannel(
                LONE_WORKER_CHANNEL_ID,
                "Priority One Lone Worker Safety Checks",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High priority alarms for lone worker safety check-in countdown and alerts"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 800, 300, 800, 300, 800)
                setSound(alarmUri, audioAttributes)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setShowBadge(true)
            }
            notificationManager.createNotificationChannel(loneWorkerChannel)

            // 2. Emergency Dispatch Channel
            val dispatchChannel = NotificationChannel(
                EMERGENCY_DISPATCH_CHANNEL_ID,
                "Priority One Emergency Dispatches",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Critical alerts for incoming emergency dispatches and alarm triggers"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 400, 1000, 400, 1000)
                setSound(alarmUri, audioAttributes)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setShowBadge(true)
            }
            notificationManager.createNotificationChannel(dispatchChannel)
        }
    }

    /**
     * Wakes up device screen if phone is locked or screen is off
     */
    fun wakeUpScreen(context: Context) {
        try {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            
            try {
                if (screenWakeLock?.isHeld == true) {
                    screenWakeLock?.release()
                }
            } catch (e: Exception) {}

            @Suppress("DEPRECATION")
            val flags = PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
                    PowerManager.ACQUIRE_CAUSES_WAKEUP or
                    PowerManager.ON_AFTER_RELEASE

            screenWakeLock = powerManager.newWakeLock(flags, "PriorityOne:EmergencyAlertWakeLock").apply {
                setReferenceCounted(false)
                acquire(25000) // Keep screen on for 25 seconds
            }
            Log.d("AlarmNotificationHelper", "Screen wake lock acquired successfully")
        } catch (e: Exception) {
            Log.e("AlarmNotificationHelper", "WakeLock acquire error", e)
        }
    }

    /**
     * Starts loud repeating alarm tone and continuous vibration pattern
     */
    @Synchronized
    fun startAlarmSoundAndVibration(context: Context) {
        if (isPlayingAlarm) return
        isPlayingAlarm = true

        // Acquire CPU partial wake lock so sound & vibration keep playing in background
        try {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            cpuWakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PriorityOne:AlertCpuWakeLock").apply {
                setReferenceCounted(false)
                acquire(60000) // 1 minute max CPU wake lock
            }
        } catch (e: Exception) {}

        try {
            val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

            // Try MediaPlayer first for reliable looping
            try {
                mediaPlayer?.release()
                mediaPlayer = MediaPlayer().apply {
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    setDataSource(context.applicationContext, alarmUri)
                    isLooping = true
                    prepare()
                    start()
                }
                Log.d("AlarmNotificationHelper", "MediaPlayer looping alarm started")
            } catch (mpEx: Exception) {
                Log.w("AlarmNotificationHelper", "MediaPlayer failed, falling back to Ringtone: ${mpEx.message}")
                val ringtone = RingtoneManager.getRingtone(context.applicationContext, alarmUri)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    ringtone.isLooping = true
                }
                ringtone.audioAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
                ringtone.play()
                activeRingtone = ringtone
            }
        } catch (e: Exception) {
            Log.e("AlarmNotificationHelper", "Alarm sound error", e)
        }

        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            val pattern = longArrayOf(0, 800, 400, 800, 400, 800, 1000)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0)) // 0 means repeat continuously
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(pattern, 0)
            }
            Log.d("AlarmNotificationHelper", "Alarm vibration pattern started")
        } catch (e: Exception) {
            Log.e("AlarmNotificationHelper", "Vibration error", e)
        }
    }

    /**
     * Stops alarm sound, vibration, and releases wake lock
     */
    @Synchronized
    fun stopAlarmSoundAndVibration(context: Context) {
        isPlayingAlarm = false

        try {
            mediaPlayer?.stop()
            mediaPlayer?.release()
            mediaPlayer = null
        } catch (e: Exception) {}

        try {
            activeRingtone?.stop()
            activeRingtone = null
        } catch (e: Exception) {}

        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }
            vibrator.cancel()
        } catch (e: Exception) {}

        try {
            if (screenWakeLock?.isHeld == true) {
                screenWakeLock?.release()
            }
            screenWakeLock = null
        } catch (e: Exception) {}

        try {
            if (cpuWakeLock?.isHeld == true) {
                cpuWakeLock?.release()
            }
            cpuWakeLock = null
        } catch (e: Exception) {}

        Log.d("AlarmNotificationHelper", "Alarm sound and vibration stopped")
    }

    /**
     * Show heads-up Lone Worker Check Notification on lockscreen
     */
    fun showLoneWorkerNotification(context: Context, title: String, message: String) {
        createNotificationChannels(context)
        wakeUpScreen(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("alertAction", "LONE_WORKER_CHECK")
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            101,
            intent,
            pendingIntentFlags
        )

        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val notification = NotificationCompat.Builder(context, LONE_WORKER_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setFullScreenIntent(pendingIntent, true)
            .setSound(alarmUri)
            .setVibrate(longArrayOf(0, 800, 300, 800, 300, 800))
            .addAction(R.mipmap.ic_launcher, "CHECK IN NOW", pendingIntent)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(LONE_WORKER_NOTIFICATION_ID, notification)
        Log.d("AlarmNotificationHelper", "Posted Lone Worker notification ID $LONE_WORKER_NOTIFICATION_ID")
    }

    /**
     * Show heads-up Emergency Dispatch Notification on lockscreen
     */
    fun showEmergencyDispatchNotification(
        context: Context,
        dispatchId: String,
        title: String,
        message: String,
        site: String
    ) {
        createNotificationChannels(context)
        wakeUpScreen(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("alertAction", "EMERGENCY_DISPATCH")
            putExtra("dispatchId", dispatchId)
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            102,
            intent,
            pendingIntentFlags
        )

        val fullText = "$message\nSite: $site"
        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val notification = NotificationCompat.Builder(context, EMERGENCY_DISPATCH_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(fullText)
            .setStyle(NotificationCompat.BigTextStyle().bigText(fullText))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setFullScreenIntent(pendingIntent, true)
            .setSound(alarmUri)
            .setVibrate(longArrayOf(0, 1000, 400, 1000, 400, 1000))
            .addAction(R.mipmap.ic_launcher, "RESPOND NOW", pendingIntent)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(EMERGENCY_DISPATCH_NOTIFICATION_ID, notification)
        Log.d("AlarmNotificationHelper", "Posted Emergency Dispatch notification ID $EMERGENCY_DISPATCH_NOTIFICATION_ID")
    }

    fun clearNotification(context: Context, notificationId: Int) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(notificationId)
    }
}
