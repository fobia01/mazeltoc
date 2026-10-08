import { validateState, type State } from "./engine";
export const KEY = "mazal-avivim-v1";
export function save(s: State) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
export function read(): State | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s ? validateState(s) : null;
  } catch {
    return null;
  }
}
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("mazal-media", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("files");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function putMedia(file: File) {
  const d = await db();
  const id = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction("files", "readwrite");
    tx.objectStore("files").put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  d.close();
  return id;
}
export async function getMedia(id: string) {
  const d = await db();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const r = d.transaction("files").objectStore("files").get(id);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  d.close();
  return blob ? URL.createObjectURL(blob) : null;
}
export function download(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
