// Grabaciones de la edición Simjat Torá + efectos originales Web Audio.
// Licencias y procedencia: public/audio/CREDITS.txt.
let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let effect: AudioBufferSourceNode | undefined;
let generation = 0;
let celebration = 0;
const buffers = new Map<string, Promise<AudioBuffer>>();
const cheers = [
  "./audio/festejo-1.mp3",
  "./audio/festejo-2.mp3",
  "./audio/festejo-3.mp3",
];
export const recordedSounds = [
  ...cheers,
  "./audio/festejo-ganador.mp3",
  "./audio/crowd-cheer-big.mp3",
  "./audio/crowd-boo-big.mp3",
  "./audio/buzzer.mp3",
];
function context() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.25;
    master.connect(compressor);
    compressor.connect(ctx.destination);
  }
  return ctx;
}
function buffer(path: string) {
  const c = context();
  if (!buffers.has(path))
    buffers.set(
      path,
      fetch(path)
        .then((r) => {
          if (!r.ok) throw Error("Audio no disponible");
          return r.arrayBuffer();
        })
        .then((data) => c.decodeAudioData(data))
        .catch((e) => {
          buffers.delete(path);
          throw e;
        }),
    );
  return buffers.get(path)!;
}
export function soundSettings(volume: number, muted: boolean) {
  if (master && ctx)
    master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.03);
}
export async function activateSound(volume: number, muted: boolean) {
  const c = context();
  await c.resume();
  soundSettings(volume, muted);
  await Promise.allSettled(recordedSounds.map(buffer));
}
function melody(kind: string) {
  const c = context();
  const notes =
    kind === "wrong"
      ? [220, 165, 110]
      : kind === "timer"
        ? [660, 440, 220]
        : kind === "wheel"
          ? [262, 330, 392, 523, 659, 784]
          : kind === "winner"
            ? [392, 392, 392, 523, 466, 523, 659, 784]
            : kind === "start"
              ? [262, 330, 392, 523, 659, 784]
              : kind === "round"
                ? [330, 392, 523]
                : [523, 659, 784, 1047];
  notes.forEach((frequency, i) => {
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = kind === "wrong" ? "triangle" : "sine";
    o.frequency.value = frequency;
    const start = c.currentTime + i * 0.11;
    g.gain.setValueAtTime(0.001, start);
    g.gain.linearRampToValueAtTime(0.22, start + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    o.connect(g);
    g.connect(master!);
    o.start(start);
    o.stop(start + 0.42);
  });
}
export function sound(kind: string, volume: number, muted: boolean) {
  if (muted || volume === 0) return;
  try {
    const c = context();
    void c.resume();
    soundSettings(volume, muted);
    const path =
      kind === "correct"
        ? cheers[celebration++ % cheers.length]
        : kind === "wrong" || kind === "boo"
          ? "./audio/crowd-boo-big.mp3"
          : kind === "winner"
            ? "./audio/festejo-ganador.mp3"
            : kind === "applause"
              ? "./audio/crowd-cheer-big.mp3"
              : kind === "timer"
                ? "./audio/buzzer.mp3"
                : null;
    if (!path) {
      melody(kind);
      return;
    }
    const ticket = ++generation;
    effect?.stop();
    effect = undefined;
    void buffer(path)
      .then((b) => {
        if (ticket !== generation) return;
        const source = c.createBufferSource(),
          g = c.createGain();
        source.buffer = b;
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.9, c.currentTime + 0.035);
        source.connect(g);
        g.connect(master!);
        effect = source;
        source.start();
        if (kind === "correct" || kind === "winner") melody(kind);
      })
      .catch(() => melody(kind));
  } catch {
    /* Un navegador sin audio puede seguir jugando. */
  }
}
