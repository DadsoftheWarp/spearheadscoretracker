let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type = 'sine', vol = 0.25) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch {
    // Audio not available in this environment
  }
}

export function playScoreUp() {
  tone(523, 0.08);
  setTimeout(() => tone(659, 0.14), 75);
}

export function playScoreDown() {
  tone(349, 0.08);
  setTimeout(() => tone(261, 0.14), 75);
}

export function playDiceRoll() {
  [0, 55, 110, 165, 220].forEach((delay) => {
    setTimeout(() => tone(180 + Math.random() * 280, 0.07, 'square', 0.1), delay);
  });
}

export function playCoinFlip() {
  tone(880, 0.04, 'sine', 0.2);
  setTimeout(() => tone(660, 0.07, 'sine', 0.18), 55);
  setTimeout(() => tone(440, 0.1, 'sine', 0.14), 130);
}
