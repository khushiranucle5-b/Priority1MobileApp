package com.myfirstapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Log.d("AlarmReceiver", "Received alarm action: $action")

        when (action) {
            ACTION_LONE_WORKER_ALARM -> {
                val title = intent.getStringExtra("title") ?: "⚠️ Lone Worker Check Required"
                val message = intent.getStringExtra("message") ?: "Your 30-minute safety check-in is due. Please confirm you are safe."

                AlarmNotificationHelper.wakeUpScreen(context)
                AlarmNotificationHelper.startAlarmSoundAndVibration(context)
                AlarmNotificationHelper.showLoneWorkerNotification(context, title, message)

                // Launch MainActivity directly over lockscreen
                try {
                    val activityIntent = Intent(context, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                                Intent.FLAG_ACTIVITY_SINGLE_TOP
                        putExtra("alertAction", "LONE_WORKER_CHECK")
                    }
                    context.startActivity(activityIntent)
                } catch (e: Exception) {
                    Log.e("AlarmReceiver", "Direct activity start failed: ${e.message}")
                }
            }
            ACTION_EMERGENCY_DISPATCH_ALARM -> {
                val dispatchId = intent.getStringExtra("dispatchId") ?: "unknown"
                val title = intent.getStringExtra("title") ?: "🚨 Emergency Dispatch Alert"
                val message = intent.getStringExtra("message") ?: "An urgent dispatch assignment has been triggered."
                val site = intent.getStringExtra("site") ?: "Assigned Site"

                AlarmNotificationHelper.wakeUpScreen(context)
                AlarmNotificationHelper.startAlarmSoundAndVibration(context)
                AlarmNotificationHelper.showEmergencyDispatchNotification(context, dispatchId, title, message, site)

                // Launch MainActivity directly over lockscreen
                try {
                    val activityIntent = Intent(context, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                                Intent.FLAG_ACTIVITY_SINGLE_TOP
                        putExtra("alertAction", "EMERGENCY_DISPATCH")
                        putExtra("dispatchId", dispatchId)
                    }
                    context.startActivity(activityIntent)
                } catch (e: Exception) {
                    Log.e("AlarmReceiver", "Direct activity start failed: ${e.message}")
                }
            }
            ACTION_STOP_ALERTS -> {
                AlarmNotificationHelper.stopAlarmSoundAndVibration(context)
                AlarmNotificationHelper.clearNotification(context, AlarmNotificationHelper.LONE_WORKER_NOTIFICATION_ID)
                AlarmNotificationHelper.clearNotification(context, AlarmNotificationHelper.EMERGENCY_DISPATCH_NOTIFICATION_ID)
            }
        }
    }

    companion object {
        const val ACTION_LONE_WORKER_ALARM = "com.myfirstapp.ACTION_LONE_WORKER_ALARM"
        const val ACTION_EMERGENCY_DISPATCH_ALARM = "com.myfirstapp.ACTION_EMERGENCY_DISPATCH_ALARM"
        const val ACTION_STOP_ALERTS = "com.myfirstapp.ACTION_STOP_ALERTS"
    }
}
