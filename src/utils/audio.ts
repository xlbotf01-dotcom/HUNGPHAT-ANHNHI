// Web Audio API ambient noise generator & subtle typewriter sound effects
let audioCtx: AudioContext | null = null;
let currentAmbientNode: AudioNode | null = null;
let ambientGain: GainNode | null = null;
let activeAmbientType: 'rain' | 'whitenoise' | 'hearth' | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTypewriterClick(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Natural mechanical typewriter click simulation
    osc.type = 'sine';
    const pitch = 700 + Math.random() * 200;
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Audio context may not be allowed prior to user interaction
  }
}

export function startAmbientSound(type: 'rain' | 'whitenoise' | 'hearth'): void {
  try {
    stopAmbientSound();
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        // Pink-ish noise filter with gentle drops
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      } else if (type === 'hearth') {
        // Brown noise with soft random crackle
        lastOut = (lastOut + 0.015 * white) / 1.015;
        const crackle = Math.random() > 0.998 ? (Math.random() * 0.4 - 0.2) : 0;
        data[i] = lastOut * 2.8 + crackle;
      } else {
        // Soft white noise
        data[i] = white * 0.15;
      }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to eliminate harsh highs
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'rain' ? 800 : type === 'hearth' ? 450 : 1200;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.06, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    noiseSource.start();
    currentAmbientNode = noiseSource;
    activeAmbientType = type;
  } catch {
    // Ignore audio initialization issues if user hasn't interacted
  }
}

export function stopAmbientSound(): void {
  if (currentAmbientNode) {
    try {
      (currentAmbientNode as AudioScheduledSourceNode).stop();
      currentAmbientNode.disconnect();
    } catch {
      // safe cleanup
    }
    currentAmbientNode = null;
  }
  activeAmbientType = null;
}

export function getActiveAmbient(): 'rain' | 'whitenoise' | 'hearth' | null {
  return activeAmbientType;
}

export function toggleAmbientSound(type: 'rain' | 'whitenoise' | 'hearth'): 'rain' | 'whitenoise' | 'hearth' | null {
  if (activeAmbientType === type) {
    stopAmbientSound();
    return null;
  } else {
    startAmbientSound(type);
    return type;
  }
}
