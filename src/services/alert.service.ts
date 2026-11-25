import { Alert as RNAlert } from 'react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertPayload {
  id: string;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: AlertType;
  cancelable?: boolean;
  onDismiss?: () => void;
}

type AlertListener = (payload: AlertPayload | null) => void;

class AlertService {
  private listeners: Set<AlertListener> = new Set();
  private currentAlert: AlertPayload | null = null;
  private isInitialized = false;
  private originalRNAlert = RNAlert.alert.bind(RNAlert);

  public subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    if (this.currentAlert) {
      listener(this.currentAlert);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentAlert);
      } catch (err) {
        console.error('Error in alert listener:', err);
      }
    });
  }

  /**
   * Automatically determines the visual alert type (success, error, warning, confirm, info)
   * based on the title, message, and buttons provided.
   */
  public detectType(title: string, message?: string, buttons?: AlertButton[]): AlertType {
    const combined = `${title} ${message || ''}`.toLowerCase();

    // If multiple buttons and one is cancel / destructive, it's a confirmation / prompt
    if (buttons && buttons.length > 1) {
      const hasCancel = buttons.some((b) => b.style === 'cancel' || b.text?.toLowerCase() === 'cancel');
      const hasDestructive = buttons.some(
        (b) => b.style === 'destructive' || b.text?.toLowerCase() === 'delete' || b.text?.toLowerCase() === 'deny'
      );
      if (hasDestructive) return 'warning';
      if (hasCancel) return 'confirm';
    }

    // Success keywords
    if (
      combined.includes('success') ||
      combined.includes('updated') ||
      combined.includes('granted') ||
      combined.includes('recorded') ||
      combined.includes('clocked in') ||
      combined.includes('clocked out') ||
      combined.includes('completed') ||
      combined.includes('saved') ||
      combined.includes('approved') ||
      combined.includes('transmitted') ||
      combined.includes('downloaded')
    ) {
      return 'success';
    }

    // Error keywords
    if (
      combined.includes('error') ||
      combined.includes('failed') ||
      combined.includes('denied') ||
      combined.includes('invalid') ||
      combined.includes('cannot') ||
      combined.includes('could not') ||
      combined.includes('blocked') ||
      combined.includes('timeout')
    ) {
      return 'error';
    }

    // Warning keywords
    if (
      combined.includes('required') ||
      combined.includes('warning') ||
      combined.includes('permission') ||
      combined.includes('alert') ||
      combined.includes('missing') ||
      combined.includes('attention') ||
      combined.includes('notice') ||
      combined.includes('caution')
    ) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * Display a custom popup modal with full configuration
   */
  public show(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean; onDismiss?: () => void; type?: AlertType }
  ) {
    const type = options?.type || this.detectType(title, message, buttons);
    const resolvedButtons: AlertButton[] =
      buttons && buttons.length > 0
        ? buttons
        : [{ text: 'OK', style: 'default' }];

    this.currentAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title || 'Notice',
      message,
      buttons: resolvedButtons,
      type,
      cancelable: options?.cancelable ?? true,
      onDismiss: options?.onDismiss,
    };

    this.notify();
  }

  public hide() {
    const alert = this.currentAlert;
    this.currentAlert = null;
    this.notify();
    if (alert?.onDismiss) {
      alert.onDismiss();
    }
  }

  // Quick helper methods
  public success(title: string, message?: string, onOk?: () => void) {
    this.show(title, message, [{ text: 'OK', style: 'default', onPress: onOk }], { type: 'success' });
  }

  public error(title: string, message?: string, onOk?: () => void) {
    this.show(title, message, [{ text: 'OK', style: 'default', onPress: onOk }], { type: 'error' });
  }

  public warning(title: string, message?: string, onOk?: () => void) {
    this.show(title, message, [{ text: 'OK', style: 'default', onPress: onOk }], { type: 'warning' });
  }

  public info(title: string, message?: string, onOk?: () => void) {
    this.show(title, message, [{ text: 'OK', style: 'default', onPress: onOk }], { type: 'info' });
  }

  public confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false
  ) {
    this.show(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: onCancel },
        { text: confirmText, style: isDestructive ? 'destructive' : 'default', onPress: onConfirm },
      ],
      { type: isDestructive ? 'warning' : 'confirm' }
    );
  }

  /**
   * Call the underlying native React Native Alert if explicitly desired
   */
  public nativeAlert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: any
  ) {
    this.originalRNAlert(title, message, buttons as any, options);
  }

  /**
   * Initializes global interception of React Native's Alert.alert.
   * Every Alert.alert() across the entire project will automatically render
   * with the modern, branded CustomAlertModal UI!
   */
  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    RNAlert.alert = (
      title: string,
      message?: string,
      buttons?: any[],
      options?: any
    ) => {
      this.show(title, message, buttons, options);
    };
  }
}

export const alertService = new AlertService();
export const AppAlert = alertService;
