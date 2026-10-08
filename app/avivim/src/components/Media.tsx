import { useEffect, useRef, useState } from "react";
import type { Question } from "../engine";
import { getMedia } from "../storage";
import { photoFor } from "../photos";
export function Media({
  q,
  volume,
  muted,
  playing,
}: {
  q: Question;
  volume: number;
  muted: boolean;
  playing: boolean;
}) {
  const photo = photoFor(q);
  const [failed, setFailed] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    let active = true;
    let object: string | null = null;
    setUrl(null);
    setFailed(false);
    if (q.media)
      getMedia(q.media)
        .then((u) => {
          object = u;
          if (active) {
            setUrl(u);
            if (!u) setFailed(true);
          }
        })
        .catch(() => {
          if (active) setFailed(true);
        });
    return () => {
      active = false;
      if (object) URL.revokeObjectURL(object);
    };
  }, [q.media, q.id]);
  useEffect(() => {
    if (audio.current) {
      audio.current.volume = volume;
      audio.current.muted = muted;
    }
  }, [volume, muted, url]);
  useEffect(() => {
    if (audio.current) {
      if (playing) void audio.current.play().catch(() => {});
      else audio.current.pause();
    }
  }, [playing, url]);
  const imageUrl = url || (photo?.src ?? null);
  if (failed)
    return (
      <p className="media-missing" role="status">
        No se encontró el archivo local. Agregalo nuevamente desde el editor.
      </p>
    );
  if (url && q.mediaType === "audio")
    return <audio ref={audio} src={url} preload="auto" />;
  if (!imageUrl) return null;
  return (
    <figure className="photo-card">
      <img
        className="object-photo"
        src={imageUrl}
        alt="Objeto para reconocer"
        onError={() => setFailed(true)}
      />
      {photo && (
        <figcaption>
          Foto: {photo.author} ·{" "}
          <a
            href={photo.licenseUrl || photo.source}
            target="_blank"
            rel="noreferrer"
          >
            {photo.license}
          </a>
        </figcaption>
      )}
    </figure>
  );
}
