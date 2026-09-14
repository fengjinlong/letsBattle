// Web Audio API sound synthesizer and mobile vibration helper

class SoundEffects {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft wooden button pop
  playButton() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Dash / Swoosh attack sound
  playDash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Punchy physical impact hit
  playHit(isBoss: boolean = false) {
    if (!this.isMuted) {
      this.initCtx();
      if (this.ctx) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = isBoss ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(isBoss ? 160 : 200, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    }

    // Mobile vibration
    this.vibrate(isBoss ? [40, 30, 40] : [35]);
  }

  // Healing sparkle arpeggio
  playHeal() {
    if (!this.isMuted) {
      this.initCtx();
      if (this.ctx) {
        const notes = [330, 415, 523, 659];
        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const noteTime = now + i * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.2, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.18);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.19);
        });
      }
    }

    this.vibrate([20, 40, 20]);
  }

  // Reveal chime
  playReveal() {
    if (!this.isMuted) {
      this.initCtx();
      if (this.ctx) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3); // A5

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
      }
    }

    this.vibrate([60, 40, 60]);
  }

  // Victory Fanfare
  playVictory() {
    if (!this.isMuted) {
      this.initCtx();
      if (this.ctx) {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const noteTime = now + i * 0.12;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.28, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.32);
        });
      }
    }

    this.vibrate([60, 40, 60, 40, 100]);
  }

  // Defeat wobble
  playDefeat() {
    if (!this.isMuted) {
      this.initCtx();
      if (this.ctx) {
        const notes = [392, 349.23, 311.13, 261.63];
        const now = this.ctx.currentTime;
        notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const noteTime = now + i * 0.15;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.22, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(noteTime);
          osc.stop(noteTime + 0.28);
        });
      }
    }

    this.vibrate([120, 60, 150]);
  }

  vibrate(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore devices with restricted vibration
      }
    }
  }
}

export const sound = new SoundEffects();
