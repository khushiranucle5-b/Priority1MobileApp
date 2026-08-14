declare const process: { env: Record<string, string | undefined> } | undefined;

export const CONFIG = {
  API_BASE_URL: (typeof process !== 'undefined' && process.env?.API_BASE_URL) || 'http://10.0.2.2:3000/api',
  APP_VERSION: '1.0.0',
  ENV: (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development',
};

