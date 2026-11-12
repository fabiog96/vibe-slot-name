import { useEffect, useState } from 'react';

const KEY_PREFIX = 'paperelle:';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    return;
  }
};

export const useStoredState = <T,>(key: string, fallback: T) => {
  const [value, setValue] = useState<T>(() => read(key, fallback));

  useEffect(() => write(key, value), [key, value]);

  return [value, setValue] as const;
};
