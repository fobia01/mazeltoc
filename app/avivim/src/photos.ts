import photoData from "./photos.json";
const photos = photoData.map((p) => ({ ...p, src: `.${p.src}` }));
import type { Question } from "./engine";
export function photoFor(q: Question) {
  return q.media ? undefined : photos.find((p) => p.id === q.id);
}
export { photos };
