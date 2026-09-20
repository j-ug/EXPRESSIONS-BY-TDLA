/**
 * Procedural ambient nature & botanical soundscape using Web Audio API
 */
class GalleryAudioController {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private chimeInterval: number | null = null;

  public async toggle(): Promise<boolean> {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      await this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public async start(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.22, this.ctx.currentTime + 3);
      this.masterGain.connect(this.ctx.destination);

      // 1. Soft leaf wind / Kaveri breeze pink-noise generator
      this.startWindNoise();

      // 2. Warm harmonic resonance drone (temple sanctuary resonance at 108Hz and 216Hz)
      this.startAmbientDrone();

      // 3. Periodic subtle wind chime ping
      this.startPeriodicChimes();

      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
    }
  }

  private startWindNoise(): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Filter for rustling leaves
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    this.noiseNode.start();
  }

  private startAmbientDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    const fundamental = 108; // Sacred harmonic frequency
    const harmonics = [1, 1.5, 2];

    harmonics.forEach((h, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * h, this.ctx.currentTime);

      const level = 0.04 / (idx + 1);
      gain.gain.setValueAtTime(level, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
    });
  }

  private startPeriodicChimes(): void {
    if (!this.ctx) return;

    const chimeFrequencies = [528, 660, 792, 1056]; // Healing solfeggio / pentatonic tones

    this.chimeInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const freq = chimeFrequencies[Math.floor(Math.random() * chimeFrequencies.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.6);
    }, 7000);
  }

  public stop(): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        if (this.noiseNode) {
          try { this.noiseNode.stop(); } catch {}
          this.noiseNode = null;
        }
        if (this.chimeInterval) {
          clearInterval(this.chimeInterval);
          this.chimeInterval = null;
        }
        if (this.ctx) {
          this.ctx.close().catch(() => {});
          this.ctx = null;
        }
        this.isPlaying = false;
      }, 800);
    } else {
      this.isPlaying = false;
    }
  }
}

export const galleryAudio = new GalleryAudioController();
