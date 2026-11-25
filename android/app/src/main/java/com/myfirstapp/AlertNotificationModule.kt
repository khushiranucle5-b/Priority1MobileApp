package com.myfirstapp

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AlertNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AlertNotificationModule"

    override fun initialize() {
        super.initialize()
        AlarmNotificationHelper.createNotificationChannels(reactContext)
    }

    /**
     * Schedules exact AlarmManager alarm using setAlarmClock to prevent OEM/Doze freezing.
     * Fires even when phone is locked, screen is off, and app is closed/swiped away.
     */
    @ReactMethod
    fun scheduleLoneWorkerAlarm(triggerTimestampMs: Double, title: String?, message: String?) {
        val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_LONE_WORKER_ALARM
            putExtra("title", title ?: "⚠️ Lone Worker Check Required")
            putExtra("message", message ?: "Your 30-minute safety check-in is due. Please confirm you are safe.")
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getBroadcast(
            reactContext,
            LONE_WORKER_ALARM_REQUEST_CODE,
            intent,
            pendingIntentFlags
        )

        val triggerTime = triggerTimestampMs.toLong()

        try {
            // setAlarmClock is exempt from Doze, app-standby, and OEM battery freezes
            val showIntent = Intent(reactContext, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("alertAction", "LONE_WORKER_CHECK")
            }
            val showPendingIntent = PendingIntent.getActivity(
                reactContext,
                LONE_WORKER_ALARM_REQUEST_CODE,
                showIntent,
                pendingIntentFlags
            )
            val alarmClockInfo = AlarmManager.AlarmClockInfo(triggerTime, showPendingIntent)
            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
            Log.i("AlertNotificationModule", "Successfully scheduled setAlarmClock for: $triggerTime")
        } catch (e: Exception) {
            Log.w("AlertNotificationModule", "setAlarmClock failed, falling back: ${e.message}")
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerTime,
                        pendingIntent
                    )
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        triggerTime,
                        pendingIntent
                    )
                }
            } catch (fallbackEx: Exception) {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            }
        }
    }

    /**
     * Helper to schedule lone worker alarm in X seconds (for instant testing with closed app)
     */
    @ReactMethod
    fun scheduleLoneWorkerAlarmInSeconds(seconds: Double, title: String?, message: String?) {
        val triggerTime = System.currentTimeMillis() + (seconds * 1000).toLong()
        scheduleLoneWorkerAlarm(triggerTime.toDouble(), title, message)
    }

    /**
     * Cancels the scheduled Lone Worker alarm and clears notification
     */
    @ReactMethod
    fun cancelLoneWorkerAlarm() {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
                action = AlarmReceiver.ACTION_LONE_WORKER_ALARM
            }

            val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }

            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                LONE_WORKER_ALARM_REQUEST_CODE,
                intent,
                pendingIntentFlags
            )

            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        } catch (e: Exception) {
            // Ignore
        }

        AlarmNotificationHelper.stopAlarmSoundAndVibration(reactContext)
        AlarmNotificationHelper.clearNotification(reactContext, AlarmNotificationHelper.LONE_WORKER_NOTIFICATION_ID)
    }

    /**
     * Trigger immediate Lone Worker check alert (wakes screen, sounds siren, shows notification)
     */
    @ReactMethod
    fun triggerLoneWorkerAlertNow(title: String?, message: String?) {
        val safeTitle = title ?: "⚠️ Lone Worker Check Required"
        val safeMessage = message ?: "Your 30-minute safety check-in is due. Please confirm you are safe."

        AlarmNotificationHelper.wakeUpScreen(reactContext)
        AlarmNotificationHelper.startAlarmSoundAndVibration(reactContext)
        AlarmNotificationHelper.showLoneWorkerNotification(reactContext, safeTitle, safeMessage)
    }

    /**
     * Trigger immediate Emergency Dispatch alert (wakes screen, sounds siren, shows notification)
     */
    @ReactMethod
    fun triggerEmergencyDispatchAlert(
        dispatchId: String,
        title: String?,
        message: String?,
        site: String?
    ) {
        val safeTitle = title ?: "🚨 Emergency Dispatch Alert"
        val safeMessage = message ?: "Urgent dispatch assigned. Respond immediately."
        val safeSite = site ?: "Assigned Site"

        AlarmNotificationHelper.wakeUpScreen(reactContext)
        AlarmNotificationHelper.startAlarmSoundAndVibration(reactContext)
        AlarmNotificationHelper.showEmergencyDispatchNotification(
            reactContext,
            dispatchId,
            safeTitle,
            safeMessage,
            safeSite
        )
    }

    /**
     * Stop all active siren/alarm sounds and vibrations
     */
    @ReactMethod
    fun stopAlertSounds() {
        AlarmNotificationHelper.stopAlarmSoundAndVibration(reactContext)
        AlarmNotificationHelper.clearNotification(reactContext, AlarmNotificationHelper.LONE_WORKER_NOTIFICATION_ID)
        AlarmNotificationHelper.clearNotification(reactContext, AlarmNotificationHelper.EMERGENCY_DISPATCH_NOTIFICATION_ID)
    }

    /**
     * Returns notification action parameters that opened or resumed the app
     */
    @ReactMethod
    fun getInitialAlertAction(promise: Promise) {
        val currentActivity = reactContext.currentActivity as? MainActivity
        val action = currentActivity?.lastAlertAction
        val dispatchId = currentActivity?.lastDispatchId

        if (action != null) {
            val map = Arguments.createMap().apply {
                putString("action", action)
                if (dispatchId != null) {
                    putString("dispatchId", dispatchId)
                }
            }
            // Clear once retrieved
            currentActivity.lastAlertAction = null
            currentActivity.lastDispatchId = null
            promise.resolve(map)
        } else {
            promise.resolve(null)
        }
    }

    companion object {
        private const val LONE_WORKER_ALARM_REQUEST_CODE = 8001
    }
}
