/**
 * Audio Synthesizer for MANU PROTOCOL: PURPLE ZONE
 * Synthesized entirely via native browser Web Audio API.
 * No external audio files or network requests required.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private helicopterOsc: OscillatorNode | null = null;
  private helicopterGain: GainNode | null = null;
  private helicopterNoiseNode: AudioBufferSourceNode | null = null;

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.helicopterGain) {
      this.helicopterGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio failure
    }
  }

  public playStepProgress() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(740, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public playAuthorized() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      // Harmonic industrial chime (two tones)
      const freqs = [330, 495, 660];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.09);

        gain.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.65);
      });
    } catch {}
  }

  public playGateRelease() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      // Low industrial metallic thud + pneumatic hiss
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch {}
  }

  public playExtractionSequence() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      // Dramatic ascension sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.1);
    } catch {}
  }

  public playFinalComplete() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      // Deep resonant resolve chord
      const chords = [164.8, 220, 293.7]; // E3, A3, D4
      chords.forEach(c => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(c, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      });
    } catch {}
  }

  public playWarning() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  }
}

export const soundFx = new SoundService();
