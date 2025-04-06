import { useState, useEffect } from "react";
import { saveData, getData } from "../helpers/storage";

export function useStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // On mount, try to fetch the value from storage
  useEffect(() => {
    const fetchStoredValue = async () => {
      try {
        const value = await getData(key);
        // Only update state if a value was found in storage
        if (value !== undefined) {
          setStoredValue(value);
        }
      } catch (error) {
        console.error(`Error reading from storage: ${error}`);
        return initialValue;
      }
    };

    fetchStoredValue();
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that persists the new value
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to storage
      await saveData(key, valueToStore);
    } catch (error) {
      console.error(`Error saving to storage: ${error}`);
    }
  };

  return [storedValue, setValue] as const;
}
