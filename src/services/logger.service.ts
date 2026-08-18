import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_KEY = '@app_logs';
const MAX_LOG_ENTRIES = 500;

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

const rawConsoleLog = console.log;
const rawConsoleWarn = console.warn;
const rawConsoleError = console.error;

let isLoggingInternal = false;
let isInitialized = false;

const formatArg = (arg: any): string => {
  if (arg === null || arg === undefined) return String(arg);
  if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
};

export const LoggerService = {
  log: async (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = { timestamp, level, message };

    // Print to developer console via raw methods to avoid loop
    if (level === 'error') {
      rawConsoleError(`[${timestamp}] [ERROR] ${message}`);
    } else if (level === 'warn') {
      rawConsoleWarn(`[${timestamp}] [WARN] ${message}`);
    } else {
      rawConsoleLog(`[${timestamp}] [INFO] ${message}`);
    }

    try {
      // Append to AsyncStorage logs
      const rawLogs = await AsyncStorage.getItem(LOG_KEY);
      let logs: LogEntry[] = [];
      if (rawLogs) {
        logs = JSON.parse(rawLogs);
      }
      
      logs.push(entry);
      
      // Limit to MAX_LOG_ENTRIES to prevent AsyncStorage bloat
      if (logs.length > MAX_LOG_ENTRIES) {
        logs = logs.slice(logs.length - MAX_LOG_ENTRIES);
      }

      await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs));
    } catch (e) {
      rawConsoleWarn('Failed to write log entry to storage:', e);
    }
  },

  initGlobalErrorHandler: () => {
    if (isInitialized) return;
    isInitialized = true;

    // Capture global JS exceptions in React Native
    const globalErrorUtils = (globalThis as any).ErrorUtils;
    if (globalErrorUtils && typeof globalErrorUtils.getGlobalHandler === 'function') {
      const originalHandler = globalErrorUtils.getGlobalHandler();
      globalErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
        const errorMsg = formatArg(error);
        LoggerService.log(`[GlobalError] ${isFatal ? 'FATAL: ' : ''}${errorMsg}`, 'error');
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    // Intercept console.error to record all console errors
    console.error = (...args: any[]) => {
      rawConsoleError(...args);
      if (!isLoggingInternal) {
        isLoggingInternal = true;
        const msg = args.map(formatArg).join(' ');
        LoggerService.log(`[ConsoleError] ${msg}`, 'error');
        isLoggingInternal = false;
      }
    };

    // Intercept console.warn to record all console warnings
    console.warn = (...args: any[]) => {
      rawConsoleWarn(...args);
      if (!isLoggingInternal) {
        isLoggingInternal = true;
        const msg = args.map(formatArg).join(' ');
        LoggerService.log(`[ConsoleWarn] ${msg}`, 'warn');
        isLoggingInternal = false;
      }
    };
  },

  getLogs: async (): Promise<LogEntry[]> => {
    try {
      const rawLogs = await AsyncStorage.getItem(LOG_KEY);
      return rawLogs ? JSON.parse(rawLogs) : [];
    } catch (e) {
      rawConsoleWarn('Failed to read logs from storage:', e);
      return [];
    }
  },

  getLogsAsText: async (): Promise<string> => {
    const logs = await LoggerService.getLogs();
    return logs
      .map((entry) => `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`)
      .join('\n');
  },

  clearLogs: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LOG_KEY);
    } catch (e) {
      rawConsoleWarn('Failed to clear logs:', e);
    }
  }
};

