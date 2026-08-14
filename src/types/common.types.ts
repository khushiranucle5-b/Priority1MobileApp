export type Nullable<T> = T | null;

export type ID = string;

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
