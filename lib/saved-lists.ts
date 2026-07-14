const STORAGE_KEY = "todoey:saved-lists";

export type SavedList = { listKey: string; label: string; savedAt: string };

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSnapshot: SavedList[] = [];

function parse(raw: string | null): SavedList[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSnapshot(): SavedList[] {
  if (typeof window === "undefined") return cachedSnapshot;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parse(raw);
  }
  return cachedSnapshot;
}

function getServerSnapshot(): SavedList[] {
  return [];
}

function writeAll(lists: SavedList[]) {
  if (typeof window === "undefined") return;
  cachedRaw = JSON.stringify(lists);
  cachedSnapshot = lists;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function getSavedLists(): SavedList[] {
  return getSnapshot();
}

export function addSavedList(listKey: string, label: string): SavedList[] {
  const withoutThisKey = getSnapshot().filter((l) => l.listKey !== listKey);
  const next = [...withoutThisKey, { listKey, label, savedAt: new Date().toISOString() }];
  writeAll(next);
  return next;
}

export function removeSavedList(listKey: string): SavedList[] {
  const next = getSnapshot().filter((l) => l.listKey !== listKey);
  writeAll(next);
  return next;
}

export function renameSavedList(listKey: string, label: string): SavedList[] {
  const next = getSnapshot().map((l) => (l.listKey === listKey ? { ...l, label } : l));
  writeAll(next);
  return next;
}

export { subscribe, getSnapshot, getServerSnapshot };
