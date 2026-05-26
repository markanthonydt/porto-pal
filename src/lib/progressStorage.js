import { createEmptyProgress, LEGACY_PROGRESS_STORAGE_KEY } from './progress';

const DB_NAME = 'porto-pal';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';
const PROGRESS_KEY = 'progress';

function writeLegacyProgress(progress) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LEGACY_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore fallback failures; the app can continue in memory.
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function readLegacyProgress() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return {
      ...createEmptyProgress(),
      ...JSON.parse(raw),
    };
  } catch {
    return null;
  }
}

function clearLegacyProgress() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_PROGRESS_STORAGE_KEY);
  } catch {
    // Ignore cleanup failures and keep the migrated copy in IndexedDB.
  }
}

function readFromStore(database, key) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

function writeToStore(database, key, value) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadStoredProgress() {
  const empty = createEmptyProgress();

  try {
    const database = await openDatabase();

    if (!database) {
      return readLegacyProgress() || empty;
    }

    const stored = await readFromStore(database, PROGRESS_KEY);

    if (stored) {
      return {
        ...empty,
        ...stored,
      };
    }

    const legacy = readLegacyProgress();

    if (legacy) {
      await writeToStore(database, PROGRESS_KEY, legacy);
      clearLegacyProgress();
      return legacy;
    }

    return empty;
  } catch {
    return readLegacyProgress() || empty;
  }
}

export async function saveStoredProgress(progress) {
  try {
    const database = await openDatabase();

    if (!database) {
      writeLegacyProgress(progress);
      return;
    }

    await writeToStore(database, PROGRESS_KEY, progress);
  } catch {
    writeLegacyProgress(progress);
  }
}
