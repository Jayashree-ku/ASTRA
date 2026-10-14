/**
 * audioEngine.js — Web Audio API procedural soundscape engine for Nine Cosmic Emotions.
 *
 * Each Rasa (emotion) generates unique procedural tones, drones and textures
 * entirely via the Web Audio API. No samples, no pretrained models.
 */

let audioCtx = null;
let masterGain = null;
let activeNodes = [];

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function stopAll() {
  activeNodes.forEach((n) => {
    try {
      n.stop && n.stop();
      n.disconnect && n.disconnect();
    } catch {}
  });
  activeNodes = [];
}

function createOscillator(freq, type = 'sine', gainVal = 0.1, detune = 0) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  g.gain.value = gainVal;
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  activeNodes.push(osc, g);
  return { osc, gain: g };
}

function createDrone(baseFreq, harmonics, gainVal = 0.08) {
  harmonics.forEach((ratio) => {
    createOscillator(baseFreq * ratio, 'sine', gainVal / harmonics.length);
  });
}

function createPulse(freq, rate, gain = 0.07) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const g = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;
  lfo.frequency.value = rate;
  lfoGain.gain.value = gain;
  g.gain.value = gain;

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(g);
  g.connect(masterGain);

  osc.start(); lfo.start();
  activeNodes.push(osc, lfo, lfoGain, g);
}

function createNoise(filterFreq = 800, gainVal = 0.04) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 2;

  const g = ctx.createGain();
  g.gain.value = gainVal;

  source.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  source.start();
  activeNodes.push(source, filter, g);
}

function addReverb(amount = 0.3) {
  const ctx = getCtx();
  const convolver = ctx.createConvolver();
  const length = ctx.sampleRate * 3;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
  }
  convolver.buffer = impulse;
  const g = ctx.createGain();
  g.gain.value = amount;
  convolver.connect(g);
  g.connect(masterGain);
  // Tap from masterGain (a bit hacky but workable)
  return convolver;
}

// ── Nine Rasas ────────────────────────────────────────────────────────────────

const RASAS = {
  Shringara: () => {
    // Love & Beauty — warm harmonics, major thirds, gentle pulse
    createDrone(220, [1, 1.25, 1.5, 2, 3], 0.1);
    createPulse(330, 0.5, 0.06);
    createOscillator(440, 'sine', 0.05, 5);
    createNoise(1200, 0.015);
  },
  Hasya: () => {
    // Joy — bright overtones, playful detune, staccato feel
    createDrone(261.63, [1, 1.26, 1.5, 2, 2.52], 0.09);
    createOscillator(523.25, 'triangle', 0.06, -8);
    createPulse(392, 2.0, 0.07);
    createNoise(2000, 0.012);
  },
  Karuna: () => {
    // Sorrow — minor chord, slow descending, low drone
    createDrone(110, [1, 1.2, 1.5, 1.8], 0.12);
    createOscillator(164.81, 'sine', 0.07, 0);
    createPulse(130.81, 0.2, 0.05);
    createNoise(300, 0.03);
  },
  Raudra: () => {
    // Fury — dissonant intervals, heavy noise, rapid pulse
    createDrone(80, [1, 1.41, 2, 2.83, 4], 0.1);
    createOscillator(113, 'sawtooth', 0.08, 20);
    createPulse(160, 4.0, 0.09);
    createNoise(600, 0.06);
  },
  Veera: () => {
    // Heroism — powerful fifths, steady march rhythm
    createDrone(130.81, [1, 1.5, 2, 3, 4], 0.1);
    createOscillator(196, 'square', 0.05, 0);
    createPulse(261.63, 1.0, 0.08);
    createNoise(900, 0.02);
  },
  Bhayanaka: () => {
    // Fear — unstable tremolo, eerie intervals, random noise
    createDrone(55, [1, 1.37, 2.05, 2.83], 0.1);
    createOscillator(77.78, 'sawtooth', 0.07, 30);
    createPulse(87.31, 6.0, 0.1);
    createNoise(400, 0.05);
  },
  Bibhatsa: () => {
    // Disgust — harsh distorted, clustered frequencies
    createDrone(100, [1, 1.05, 1.1, 2, 2.1], 0.09);
    createOscillator(104, 'sawtooth', 0.08, 50);
    createPulse(210, 3.5, 0.08);
    createNoise(1500, 0.04);
  },
  Adbhuta: () => {
    // Wonder — bright shimmer, high harmonics, spacious
    createDrone(174.61, [1, 2, 4, 8, 16], 0.07);
    createOscillator(523.25, 'sine', 0.06, -3);
    createPulse(698.46, 0.33, 0.05);
    createNoise(3000, 0.01);
  },
  Shanta: () => {
    // Peace — pure sine, perfect octaves, very slow fade
    createDrone(136.1, [1, 2, 3, 4, 6], 0.08); // 136.1 Hz = AUM / Earth frequency
    createOscillator(272.2, 'sine', 0.04, 0);
    createNoise(200, 0.01);
  },
};

export const EMOTION_CONFIG = {
  Shringara: { color: '#ff6699', particleColor: '#ffaacc', label: 'Shringara — Love & Beauty' },
  Hasya:     { color: '#ffdd00', particleColor: '#ffffaa', label: 'Hasya — Joy & Laughter' },
  Karuna:    { color: '#4488ff', particleColor: '#aaccff', label: 'Karuna — Sorrow & Compassion' },
  Raudra:    { color: '#ff2200', particleColor: '#ff8866', label: 'Raudra — Fury & Wrath' },
  Veera:     { color: '#ff8800', particleColor: '#ffcc88', label: 'Veera — Heroism & Valor' },
  Bhayanaka: { color: '#220066', particleColor: '#6600cc', label: 'Bhayanaka — Terror & Fear' },
  Bibhatsa:  { color: '#44aa44', particleColor: '#88ff88', label: 'Bibhatsa — Disgust & Revulsion' },
  Adbhuta:   { color: '#00ffff', particleColor: '#aaffff', label: 'Adbhuta — Wonder & Amazement' },
  Shanta:    { color: '#ffffff', particleColor: '#eeeeff', label: 'Shanta — Peace & Serenity' },
};

export function playEmotion(name, isMuted = false) {
  stopAll();
  const ctx = getCtx();
  if (masterGain) masterGain.gain.value = isMuted ? 0 : 0.6;
  const fn = RASAS[name];
  if (fn) fn();
}

export function stopAudio() {
  stopAll();
}

export function setMuted(muted) {
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.6;
}

export function playImpactFx() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.8);

    g.gain.setValueAtTime(0.35, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  } catch (e) {
    console.error(e);
  }
}

export function playChimeFx() {
  try {
    const ctx = getCtx();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      g.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
    });
  } catch (e) {
    console.error(e);
  }
}

export function playPingFx() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {
    console.error(e);
  }
}

