// 轻量级音效系统
class SoundManager {
  private enabled: boolean = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // 点击音效（短促的咔哒声）
  playClick() {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }

  // 悬停音效（柔和的嗡鸣）
  playHover() {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 600;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  // 成功音效（上升音调）
  playSuccess() {
    if (!this.enabled || !this.audioContext) return;

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.15);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }
}

export const soundManager = new SoundManager();

// 自动为按钮添加音效
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a[href], [data-cursor-hover]')) {
        soundManager.playClick();
      }
    });
  });
}
