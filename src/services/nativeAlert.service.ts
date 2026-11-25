import { NativeModules, Platform } from 'react-native';
import { LoggerService } from './logger.service';

const { AlertNotificationModule } = NativeModules;

export interface AlertNotificationAction {
  action: 'LONE_WORKER_CHECK' | 'EMERGENCY_DISPATCH' | string;
  dispatchId?: string;
}

class NativeAlertService {
  /**
   * Schedule exact AlarmManager alarm that triggers even when phone is in sleep/Doze mode or screen is off.
   */
  public scheduleLoneWorkerAlarm(
    triggerTimestampMs: number,
    title: string = '⚠️ Lone Worker Check Required',
    message: string = 'Your 30-minute safety check-in is due. Please confirm you are safe.'
  ): void {
    if (Platform.OS !== 'android' || !AlertNotificationModule) {
      return;
    }

    try {
      LoggerService.log(`[NativeAlertService] Scheduling native lone worker alarm at ${new Date(triggerTimestampMs).toLocaleTimeString()}`);
      AlertNotificationModule.scheduleLoneWorkerAlarm(triggerTimestampMs, title, message);
    } catch (e: any) {
      LoggerService.log(`[NativeAlertService] Failed to schedule lone worker alarm: ${e?.message || e}`, 'error');
    }
  }

  /**
   * Schedule lone worker alarm in X seconds (for rapid testing with closed app / locked phone)
   */
  public scheduleLoneWorkerAlarmInSeconds(
    seconds: number = 10,
    title: string = '⚠️ Lone Worker Check Required',
    message: string = 'Your safety check-in is due. Please confirm you are safe.'
  ): void {
    if (Platform.OS !== 'android' || !AlertNotificationModule) {
      return;
    }

    try {
      LoggerService.log(`[NativeAlertService] Scheduling native lone worker alarm in ${seconds}s`);
      AlertNotificationModule.scheduleLoneWorkerAlarmInSeconds(seconds, title, message);
    } catch (e: any) {
      LoggerService.log(`[NativeAlertService] Failed to schedule lone worker alarm: ${e?.message || e}`, 'error');
    }
  }

  /**
   * Cancel pending lone worker alarm and clear notifications & sounds.
   */
  public cancelLoneWorkerAlarm(): void {
    if (Platform.OS !== 'android' || !AlertNotificationModule) {
      return;
    }

    try {
      LoggerService.log('[NativeAlertService] Cancelling lone worker alarm');
      AlertNotificationModule.cancelLoneWorkerAlarm();
    } catch (e: any) {
      LoggerService.log(`[NativeAlertService] Failed to cancel lone worker alarm: ${e?.message || e}`, 'error');
    }
  }

  /**
   * Trigger immediate lone worker check-in alert (turns screen on, plays alarm tone, vibrates, shows lockscreen notification).
   */
  public triggerLoneWorkerAlertNow(
    title: string = '⚠️ Lone Worker Check Required',
    message: string = 'Your 30-minute safety check-in is due. Please confirm you are safe.'
  ): void {
    if (Platform.OS !== 'android' || !AlertNotificationModule) {
      return;
    }

    try {
      LoggerService.log('[NativeAlertService] Triggering immediate lone worker alert');
      AlertNotificationModule.triggerLoneWorkerAlertNow(title, message);
    } catch (e: any) {
      LoggerService.log(`[NativeAlertService] Failed to trigger lone worker alert: ${e?.message || e}`, 'error');
    }
  }

  /**
   * Trigger urgent emergency dispatch alert (turns screen on, plays alarm tone, vibrates, shows lockscreen notification).
   */
  public triggerEmergencyDispatchAlert(
    dispatchId: string,
    title: string = '🚨 Emergency Dispatch Alert',
    message: string = 'Urgent dispatch assigned. Respond immediately.',
    site: string = 'Assigned Site'
  ): void {
    if (Platform.OS !== 'android' || !AlertNotificationModule) {
      return;
    }

    try {
      LoggerService.log(`[NativeAlertService] Triggering emergency dispatch alert for ${dispatchId}`);
      AlertNotificationModule.triggerEmergencyDispatchAlert(dispatchId, title, message, site);
    } catch (e: any) {
      LoggerService.log(`[NativeAlertService] Failed to trigger emergency dispatch alert: ${e?.message || e}`, 'error');
    }
  }

  /**
   * Stop active alarm ringtone, vibration, and clear alert notifications.
   */
  public stopAlertSounds(): void {
    if (Platform.OS !== 'android' || !AlertNotificationModule) {
      return;
    }

    try {
      LoggerService.log('[NativeAlertService] Stopping alert sounds and vibrations');
      AlertNotificationModule.stopAlertSounds();
    } catch (e: any) {
      LoggerService.log(`[NativeAlertService] Failed to stop alert sounds: ${e?.message || e}`, 'error');
    }
  }

  /**
   * Check if app was opened/resumed via alert notification intent (CHECK IN NOW or RESPOND NOW).
   */
  public async getInitialAlertAction(): Promise<AlertNotificationAction | null> {
    if (Platform.OS !== 'android' || !AlertNotificationModule) {
      return null;
    }

    try {
      const actionData = await AlertNotificationModule.getInitialAlertAction();
      return actionData || null;
    } catch (e: any) {
      LoggerService.log(`[NativeAlertService] Error reading initial alert action: ${e?.message || e}`, 'error');
      return null;
    }
  }
}

export const nativeAlertService = new NativeAlertService();
