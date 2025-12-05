import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
};

// Специализированные хуки для конкретных типов данных
export const useLocalStorageBoolean = (key: string, initialValue: boolean) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  return [value as boolean, setValue, removeValue] as const;
};

export const useLocalStorageString = (key: string, initialValue: string) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  return [value as string, setValue, removeValue] as const;
};

export const useLocalStorageNumber = (key: string, initialValue: number) => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  return [value as number, setValue, removeValue] as const;
};