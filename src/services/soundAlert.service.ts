import { Vibration, Platform } from 'react-native';
import { LoggerService } from './logger.service';

class SoundAlertService {
  private isAlerting: boolean = false;
  private audioContext: any = null;
  private alertInterval: any = null;

  /**
   * Start 2-3 repeated alert tones + vibration pattern when Lone Worker Safety check is due.
   */
  public startSafetyAlert(): void {
    if (this.isAlerting) return;
    this.isAlerting = true;
    LoggerService.log('[SoundAlertService] Starting Lone Worker Safety Alert sound & vibration');

    // 1. Device Vibration: Pattern [pause, vibrate, pause, vibrate, pause, vibrate]
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        // Repeated vibration pattern for noticeability
        Vibration.vibrate([0, 400, 200, 400, 200, 400], false);
      }
    } catch (e) {
      LoggerService.log('[SoundAlertService] Vibration failed, continuing with audio/visual', 'warn');
    }

    // 2. Audio playback tone fallback / web audio synthesizer
    try {
      const AudioCtx = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        this.playBeepSequence();
      }
    } catch (e) {
      LoggerService.log('[SoundAlertService] AudioContext tone synthesis unavailable, falling back to vibration + visual alert', 'warn');
    }
  }

  private playBeepSequence(): void {
    if (!this.audioContext || !this.isAlerting) return;

    let count = 0;
    const playBeep = () => {
      if (!this.isAlerting || count >= 3) {
        if (this.alertInterval) clearInterval(this.alertInterval);
        return;
      }
      try {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5 note
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
        count++;
      } catch (err) {
        // Ignore audio errors gracefully
      }
    };

    playBeep();
    this.alertInterval = setInterval(playBeep, 400);
  }

  /**
   * Stop all alert sounds and vibration.
   */
  public stopSafetyAlert(): void {
    if (!this.isAlerting) return;
    this.isAlerting = false;
    LoggerService.log('[SoundAlertService] Stopping Lone Worker Safety Alert sound & vibration');

    try {
      Vibration.cancel();
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
