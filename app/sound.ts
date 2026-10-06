let audio: AudioContext | null = null;
let paperFile: Promise<ArrayBuffer> | null = null;
let paperDecoded: Promise<AudioBuffer> | null = null;
let paperBuffer: AudioBuffer | null = null;
let waitingForPaper = false;
let enabled = true;

export function setAudioEnabled(value: boolean) {
  enabled = value;
}

export function preloadPaper() {
  paperFile ??= fetch("/sounds/paper-page-turn.mp3").then((response) => {
    if (!response.ok) throw new Error("Paper sound unavailable");
    return response.arrayBuffer();
  });
  return paperFile;
}

function decodePaper(context: AudioContext) {
  paperDecoded ??= preloadPaper().then((data) => context.decodeAudioData(data.slice(0))).then((decoded) => {
    paperBuffer = decoded;
    return decoded;
  });
  return paperDecoded;
}

// Audio starts only after a pointer or keyboard gesture, as browsers require.
export function unlockAudio() {
  if (typeof window === "undefined") return;
  audio ??= new AudioContext();
  if (audio.state === "suspended") void audio.resume();
  void decodePaper(audio).catch(() => {});
}

function readyAudio() {
  // Nodes queued during the first gesture play as soon as resume() completes.
  return audio;
}

function playRecordedPaper(context: AudioContext, strength: number, full: boolean) {
  if (!paperBuffer || !enabled) return;
  const now = context.currentTime;
  const duration = full ? Math.min(1.3, paperBuffer.duration) : 0.34;
  const offset = full ? 0 : 0.08 + Math.random() * Math.max(0, paperBuffer.duration - duration - 0.16);
  const source = context.createBufferSource();
  source.buffer = paperBuffer;
  source.playbackRate.value = 0.95 + Math.random() * 0.1;
  const volume = context.createGain();
  const level = Math.min(1, Math.max(0, strength)) * (full ? 0.65 : 0.48);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.linearRampToValueAtTime(level, now + 0.025);
  volume.gain.setValueAtTime(level, now + duration - 0.085);
  volume.gain.linearRampToValueAtTime(0.0001, now + duration);
  source.connect(volume).connect(context.destination);
  source.start(now, offset, duration);
  source.stop(now + duration);
  source.onended = () => { source.disconnect(); volume.disconnect(); };
}

export function playPaper(strength = 1, full = false) {
  if (!enabled) return;
  const context = readyAudio();
  if (!context) return;
  if (paperBuffer) { playRecordedPaper(context, strength, full); return; }
  if (waitingForPaper) return;
  waitingForPaper = true;
  void decodePaper(context).then(() => playRecordedPaper(context, strength, full)).catch(() => {}).finally(() => { waitingForPaper = false; });
}

function playSoftNote(pitch: number, delay: number, duration: number) {
  const context = readyAudio();
  if (!context || !enabled) return;
  const start = context.currentTime + delay;
  const tone = context.createOscillator();
  const volume = context.createGain();
  tone.type = "sine";
  tone.frequency.setValueAtTime(pitch, start);
  tone.frequency.exponentialRampToValueAtTime(pitch * 0.92, start + duration);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.linearRampToValueAtTime(0.017, start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  tone.connect(volume).connect(context.destination);
  tone.start(start);
  tone.stop(start + duration);
  tone.onended = () => { tone.disconnect(); volume.disconnect(); };
}

export function playMenu() {
  playSoftNote(490, 0, 0.065);
}

export function playTheme() {
  playSoftNote(400, 0, 0.09);
  playSoftNote(600, 0.07, 0.11);
}
