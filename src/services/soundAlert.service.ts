import { Vibration, Platform } from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import { LoggerService } from './logger.service';

class SoundAlertService {
  private isAlerting: boolean = false;
  private alertInterval: any = null;

  public playSafetyAlert(): void {
    this.startSafetyAlert();
  }

  /**
   * Start 2-3 repeated alert tones + vibration pattern when Geofence / Safety check is triggered.
   */
  public startSafetyAlert(): void {
    if (this.isAlerting) return;
    this.isAlerting = true;
    LoggerService.log('[SoundAlertService] Starting Geofence / Safety Alert sound & vibration');

    // 1. Device Vibration: Pattern [pause, vibrate, pause, vibrate, pause, vibrate]
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        Vibration.vibrate([0, 500, 200, 500, 200, 500], false);
      }
    } catch (e) {
      LoggerService.log('[SoundAlertService] Vibration failed, continuing with audio/visual', 'warn');
    }

    // 2. Play Audio alert sound using react-native-sound-player
    try {
      // Play alarm beep sound
      SoundPlayer.playUrl('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      
      let count = 1;
      this.alertInterval = setInterval(() => {
        if (!this.isAlerting || count >= 3) {
          if (this.alertInterval) {
            clearInterval(this.alertInterval);
            this.alertInterval = null;
          }
          return;
        }
        try {
          SoundPlayer.playUrl('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        } catch (err) {
          // Ignore secondary playback errors
        }
        count++;
      }, 600);
    } catch (e: any) {
      LoggerService.log(`[SoundAlertService] SoundPlayer playback error: ${e?.message || e}`, 'warn');

      // Fallback: Web Audio synthesis if running in web/browser environment
      try {
        const AudioCtx = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
        }
      } catch (fallbackErr) {
        // Safe fallback ignored
      }
    }
  }

  /**
   * Stop all alert sounds and vibration.
   */
  public stopSafetyAlert(): void {
    if (!this.isAlerting) return;
    this.isAlerting = false;
    LoggerService.log('[SoundAlertService] Stopping Geofence / Safety Alert sound & vibration');

    try {
      Vibration.cancel();
    } catch (e) {
      // Ignore
    }

    try {
      SoundPlayer.stop();
    } catch (e) {
      // Ignore
    }

    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
  }
}

export const soundAlertService = new SoundAlertService();
