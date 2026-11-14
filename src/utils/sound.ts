type WaveType = 'sine' | 'triangle';

const NAV_SCALE = [392, 440, 494, 587, 659];
const ROW_SCALE = [330, 370, 415, 440];
const TILE_SCALE = [360, 415, 470, 530, 600];

const CLICK_SELECTOR = [
  'button',
  'a[href]',
  '[data-cursor-hover]',
  '[data-badge-tooltip]',
  '.github-calendar__cell[data-date]',
  '.leetcode-calendar__cell[data-date]'
].join(', ');

const HOVER_SELECTOR = [
  'button',
  'a[href]',
  '[data-cursor-hover]',
  '[data-badge-tooltip]',
  '.github-calendar__cell[data-date]',
  '.leetcode-calendar__cell[data-date]'
].join(', ');

function getIndexInGroup(element: HTMLElement, itemSelector: string, containerSelector: string): number {
  const container = element.closest(containerSelector);
  if (!container) return 0;
  const items = Array.from(container.querySelectorAll(itemSelector));
  const index = items.indexOf(element);
  return index >= 0 ? index : 0;
}

function getCalendarTileLevel(tile: HTMLElement): number {
  const match = tile.className.match(/--level-(\d)/);
  if (match) return Math.min(4, Math.max(0, Number(match[1])));

  const count = Number(tile.dataset.count || '0');
  if (count >= 8) return 4;
  if (count >= 4) return 3;
  if (count >= 2) return 2;
  if (count > 0) return 1;
  return 0;
}

class SoundManager {
  private static readonly VOLUME_SCALE = 1.45;
  private static readonly ATTACK_SEC = 0.006;
  private static readonly TILE_COOLDOWN_MS = 45;
  private static readonly BOUNDARY_COOLDOWN_MS = 220;

  private enabled = false;
  private audioContext: AudioContext | null = null;
  private lastTileSoundTime = 0;
  private lastBoundarySoundTime = 0;

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

  private playTone(
    frequency: number,
    duration: number,
    volume: number,
    delay = 0,
    type: WaveType = 'sine'
  ) {
    if (!this.enabled) return;

    const context = this.getAudioContext();
    if (!context) return;

    const startTime = context.currentTime + delay;
    const attackEnd = startTime + Math.min(SoundManager.ATTACK_SEC, duration * 0.35);
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const peakGain = Math.max(0.0015, volume * SoundManager.VOLUME_SCALE);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(peakGain, attackEnd);
    gainNode.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.005);
  }

  private playGlide(
    startFreq: number,
    endFreq: number,
    duration: number,
    volume: number,
    type: WaveType = 'triangle',
    delay = 0
  ) {
    if (!this.enabled) return;

    const context = this.getAudioContext();
    if (!context) return;

    const startTime = context.currentTime + delay;
    const attackEnd = startTime + Math.min(SoundManager.ATTACK_SEC, duration * 0.3);
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const peakGain = Math.max(0.0015, volume * SoundManager.VOLUME_SCALE);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFreq, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, endFreq), startTime + duration);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(peakGain, attackEnd);
    gainNode.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.005);
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
    this.playTone(640, 0.055, 0.036, 0, 'sine');
  }

  playHover() {
    this.playTone(500, 0.065, 0.016, 0, 'sine');
  }

  playSuccess() {
    this.playTone(523, 0.1, 0.04, 0, 'sine');
    this.playTone(659, 0.13, 0.035, 0.07, 'sine');
  }

  playScrollBoundary(edge: 'top' | 'bottom') {
    if (!this.enabled) return;

    const now = performance.now();
    if (now - this.lastBoundarySoundTime < SoundManager.BOUNDARY_COOLDOWN_MS) return;
    this.lastBoundarySoundTime = now;

    if (edge === 'bottom') {
      this.playTone(420, 0.065, 0.028, 0, 'sine');
      this.playTone(330, 0.095, 0.022, 0.045, 'triangle');
    } else {
      this.playTone(350, 0.065, 0.028, 0, 'sine');
      this.playTone(440, 0.095, 0.022, 0.045, 'triangle');
    }
  }

  handleHover(target: HTMLElement) {
    if (!this.enabled) return;
    if (target.closest('#projects')) return;

    if (target.matches('.github-calendar__cell[data-date], .leetcode-calendar__cell[data-date]')) {
      const now = performance.now();
      if (now - this.lastTileSoundTime < SoundManager.TILE_COOLDOWN_MS) return;
      this.lastTileSoundTime = now;
      const level = getCalendarTileLevel(target);
      this.playTone(TILE_SCALE[level], 0.045, 0.01, 0, 'sine');
      return;
    }

    if (target.matches('[data-badge-tooltip]')) {
      this.playTone(587, 0.08, 0.014, 0, 'sine');
      this.playTone(735, 0.08, 0.006, 0.015, 'sine');
      return;
    }

    if (target.matches('.hero__index a')) {
      const index = getIndexInGroup(target, '.hero__index a', '.hero__index');
      this.playTone(NAV_SCALE[index % NAV_SCALE.length], 0.065, 0.018, 0, 'sine');
      return;
    }

    if (target.matches('.nav__link')) {
      const index = getIndexInGroup(target, '.nav__link', '.nav__links');
      this.playTone(NAV_SCALE[index % NAV_SCALE.length], 0.06, 0.016, 0, 'sine');
      return;
    }

    if (target.matches('.hero__advance')) {
      this.playTone(494, 0.07, 0.016, 0, 'sine');
      return;
    }

    if (target.matches('.profile__row')) {
      const index = getIndexInGroup(target, '.profile__row', '.profile__rows');
      this.playTone(ROW_SCALE[index % ROW_SCALE.length], 0.08, 0.014, 0, 'triangle');
      return;
    }

    if (target.matches('.recognition-list__group')) {
      const index = getIndexInGroup(target, '.recognition-list__group', '.recognition-list');
      this.playTone(ROW_SCALE[index % ROW_SCALE.length], 0.08, 0.014, 0, 'triangle');
      return;
    }

    if (target.matches('.experience__item')) {
      const index = getIndexInGroup(target, '.experience__item', '.experience__timeline');
      this.playTone(ROW_SCALE[index % ROW_SCALE.length], 0.08, 0.014, 0, 'triangle');
      return;
    }

    if (target.matches('.github-link-badge, .leetcode-link-badge, .hero__link[href]')) {
      this.playTone(560, 0.065, 0.018, 0, 'sine');
      return;
    }

    this.playHover();
  }

  handleClick(target: HTMLElement) {
    if (!this.enabled) return;
    if (target.closest('#projects')) return;

    if (target.matches('.back-to-top')) {
      this.playGlide(380, 640, 0.11, 0.032, 'sine');
      return;
    }

    if (target.matches('[data-copy]')) {
      this.playTone(523, 0.075, 0.034, 0, 'sine');
      this.playTone(659, 0.1, 0.03, 0.055, 'sine');
      return;
    }

    if (target.matches('[data-wechat-btn]')) {
      this.playTone(440, 0.07, 0.03, 0, 'sine');
      this.playTone(554, 0.1, 0.028, 0.05, 'sine');
      return;
    }

    if (target.matches('[data-modal-close]')) {
      this.playTone(554, 0.065, 0.026, 0, 'sine');
      this.playTone(440, 0.085, 0.024, 0.045, 'sine');
      return;
    }

    if (target.matches('.hero__index a, .nav__link, .hero__advance')) {
      const freq = target.matches('.hero__index a')
        ? NAV_SCALE[getIndexInGroup(target, '.hero__index a', '.hero__index') % NAV_SCALE.length]
        : target.matches('.nav__link')
          ? NAV_SCALE[getIndexInGroup(target, '.nav__link', '.nav__links') % NAV_SCALE.length]
          : 494;
      this.playTone(freq, 0.06, 0.028, 0, 'sine');
      this.playTone(Math.round(freq * 1.25), 0.09, 0.024, 0.045, 'sine');
      return;
    }

    if (target.matches('.github-link-badge, .leetcode-link-badge, .hero__link[href]')) {
      this.playTone(520, 0.06, 0.03, 0, 'sine');
      this.playTone(693, 0.095, 0.028, 0.05, 'sine');
      return;
    }

    if (target.matches('[data-badge-tooltip]')) {
      this.playTone(587, 0.07, 0.022, 0, 'sine');
      this.playTone(735, 0.085, 0.014, 0.03, 'sine');
      return;
    }

    if (target.matches('.github-calendar__cell[data-date], .leetcode-calendar__cell[data-date]')) {
      const level = getCalendarTileLevel(target);
      this.playTone(TILE_SCALE[level], 0.065, 0.022, 0, 'sine');
      return;
    }

    if (target.matches('.profile__row, .recognition-list__group, .experience__item')) {
      return;
    }

    this.playClick();
  }
}

export const soundManager = new SoundManager();

if (typeof window !== 'undefined') {
  const getSoundTarget = (target: EventTarget | null, selector: string) => {
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>(selector);
  };

  document.addEventListener('click', (event) => {
    const target = getSoundTarget(event.target, CLICK_SELECTOR);
    if (target && !target.matches('[data-sound-control]')) {
      soundManager.handleClick(target);
    }
  });

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;

    const target = getSoundTarget(event.target, HOVER_SELECTOR);
    if (!target || target.matches('[data-sound-control]')) return;

    const previousTarget = event.relatedTarget;
    if (previousTarget instanceof Node && target.contains(previousTarget)) return;

    soundManager.handleHover(target);
  });
}
