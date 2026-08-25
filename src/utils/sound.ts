class SoundManager {
  private enabled = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    const storedPreference = window.localStorage.getItem('interaction-sound-enabled');
    if (storedPreference !== null) {
      this.enabled = storedPreference === 'true';
    }
  }

  private getAudioContext() {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return null;

    if (!this.audioContext) {
      // Create the context on the first user interaction so browsers allow playback.
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, volume: number, delay = 0) {
    if (!this.enabled) return;

    const context = this.getAudioContext();
    if (!context) return;

    const startTime = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  toggle() {
    this.enabled = !this.enabled;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('interaction-sound-enabled', String(this.enabled));
    }

    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  playClick() {
    this.playTone(720, 0.055, 0.045);
  }

  playHover() {
    this.playTone(520, 0.07, 0.018);
  }

  playSuccess() {
    this.playTone(620, 0.11, 0.045);
    this.playTone(880, 0.14, 0.04, 0.08);
  }
}

export const soundManager = new SoundManager();

if (typeof window !== 'undefined') {
  const getSoundTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>('button, a[href], [data-cursor-hover]');
  };

  document.addEventListener('click', (event) => {
    const target = getSoundTarget(event.target);
    if (target && !target.matches('[data-sound-control]')) {
      soundManager.playClick();
    }
  });

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;

    const target = getSoundTarget(event.target);
    if (!target || target.matches('[data-sound-control]')) return;

    const previousTarget = event.relatedTarget;
    if (previousTarget instanceof Node && target.contains(previousTarget)) return;

    soundManager.playHover();
  });
}
