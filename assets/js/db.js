/**
 * Reylo AI — local gallery persistence (IndexedDB).
 * Videos never leave the visitor's browser; nothing is uploaded to any server
 * of ours (there is no server of ours — the site is 100% static).
 */

const DB_NAME = "reylo-ai";
const DB_VERSION = 1;
const STORE = "gallery";
export const MAX_GALLERY_ITEMS = 12;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB open failed"));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

/** @returns {Promise<Array<object>>} newest first */
export async function listGallery() {
  const db = await openDB();
  return await new Promise((resolve, reject) => {
    const req = tx(db, "readonly").getAll();
    req.onsuccess = () => {
      const items = req.result || [];
      items.sort((a, b) => b.createdAt - a.createdAt);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * @param {{blob: Blob, poster: Blob|null, prompt: string, seed: number,
 *          durationSec: number, steps: number}} item
 */
export async function addToGallery(item) {
  const db = await openDB();
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    blob: item.blob,
    poster: item.poster || null,
    prompt: item.prompt,
    seed: item.seed,
    durationSec: item.durationSec,
    steps: item.steps,
    bytes: item.blob.size,
  };
  await new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  await pruneGallery();
  return record;
}

export async function removeFromGallery(id) {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearGallery() {
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const req = tx(db, "readwrite").clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function pruneGallery() {
  try {
    const items = await listGallery();
    if (items.length <= MAX_GALLERY_ITEMS) return;
    for (const extra of items.slice(MAX_GALLERY_ITEMS)) {
      await removeFromGallery(extra.id);
    }
  } catch {
    /* pruning is best-effort */
  }
}

/** Rough storage usage of the gallery, in bytes. */
export async function galleryUsage() {
  if (navigator.storage?.estimate) {
    const est = await navigator.storage.estimate();
    return { usage: est.usage || 0, quota: est.quota || 0 };
  }
  return { usage: 0, quota: 0 };
}
