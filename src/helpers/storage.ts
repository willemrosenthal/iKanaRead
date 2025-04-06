import { openDB } from "idb";

export enum STORES {
  SETTINGS = "settings",
  DATA = "data",
}

// Open (or create) the database
const dbPromise = openDB("infoLockerDb", 1, {
  upgrade(db) {
    db.createObjectStore(STORES.SETTINGS);
    db.createObjectStore(STORES.DATA);
  },
});

// Save data persistently
export const saveData = async (
  key: string,
  value: any,
  storeName: STORES = STORES.DATA
) => {
  const db = await dbPromise;
  await db.put(storeName, value, key);
};

// Get data
export const getData = async (key: string, storeName: STORES = STORES.DATA) => {
  const db = await dbPromise;
  return db.get(storeName, key);
};

// // Example usage
// saveData("theme", "dark"); // Saves theme setting persistently
// getData("theme").then(console.log); // Logs 'dark' even after cache is cleared
