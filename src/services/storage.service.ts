import AsyncStorage from '@react-native-async-storage/async-storage';

const set = async (key: string, value: unknown): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

const get = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  return JSON.parse(raw) as T;
};

const getString = async (key: string): Promise<string | null> => {
  return AsyncStorage.getItem(key);
};

const setString = async (key: string, value: string): Promise<void> => {
  await AsyncStorage.setItem(key, value);
};

const remove = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};

const clear = async (): Promise<void> => {
  await AsyncStorage.clear();
};

const multiGet = async <T>(keys: string[]): Promise<Record<string, T | null>> => {
  const pairs = await (AsyncStorage as any).multiGet(keys);
  return (pairs as [string, string | null][]).reduce<Record<string, T | null>>((acc: Record<string, T | null>, [key, value]: [string, string | null]) => {
    acc[key] = value !== null ? (JSON.parse(value) as T) : null;
    return acc;
  }, {});
};

export const StorageService = {
  set,
  get,
  getString,
  setString,
  remove,
  clear,
  multiGet,
};
