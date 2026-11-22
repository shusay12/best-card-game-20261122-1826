// Tiny WebAudio chimes, synthesized live — no audio files, no network.
// Every sound is a short oscillator phrase; muted state lives here too.
let audioCtx = null;
let muted = false;

export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; return muted; }

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(freq, startAt, dur, type = 'sine', vol = 0.12) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

export const sfx = {
  deal() { tone(520, 0, 0.09, 'triangle', 0.08); },
  play() { tone(660, 0, 0.1, 'triangle', 0.1); tone(880, 0.07, 0.12, 'triangle', 0.08); },
  hit() { tone(180, 0, 0.16, 'sawtooth', 0.1); tone(120, 0.05, 0.18, 'sawtooth', 0.08); },
  heal() { tone(523, 0, 0.14, 'sine', 0.1); tone(784, 0.09, 0.2, 'sine', 0.09); },
  shield() { tone(392, 0, 0.12, 'square', 0.05); tone(523, 0.08, 0.14, 'square', 0.05); },
  draw() { tone(740, 0, 0.07, 'triangle', 0.07); },
  turn() { tone(440, 0, 0.08, 'triangle', 0.07); },
  denied() { tone(160, 0, 0.12, 'square', 0.07); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.11)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.3, 'sine', 0.1)); },
};
