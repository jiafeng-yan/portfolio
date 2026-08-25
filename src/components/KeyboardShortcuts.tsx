import { useEffect, useState } from 'react';
import './KeyboardShortcuts.css';

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(max-width: 768px)').matches) return;

    // 首次访问显示欢迎提示
    const hasVisited = localStorage.getItem('kb-shortcuts-seen');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('kb-shortcuts-seen', 'true');

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimeout(() => setShowWelcome(false), 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(max-width: 768px)').matches) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果在输入框中，不触发快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // H - 显示帮助
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // ESC - 关闭帮助
      if (e.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      // ↑ - 回到顶部
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // ↓ - 回到底部
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
      }

      // 数字键 1-5 - 跳转到各区域
      const sections = ['hero', 'profile', 'projects', 'skills', 'experience'];
      const num = parseInt(e.key);
      if (num >= 1 && num <= sections.length) {
        e.preventDefault();
        const section = document.querySelector(`[data-section="${sections[num - 1]}"]`);
        section?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 欢迎提示 */}
      <div className={`keyboard-welcome ${showWelcome ? 'keyboard-welcome--visible' : ''}`}>
        <div className="keyboard-welcome__content">
          <div className="keyboard-welcome__countdown">{countdown}</div>
          <div className="keyboard-welcome__text">
            <strong>快捷键可用</strong>
            <p>按 <kbd>H</kbd> 查看所有快捷键</p>
          </div>
        </div>
      </div>

      {/* 常驻入口 - 右上角小图标 */}
      <button
        className="keyboard-trigger"
        onClick={() => setShowHelp(true)}
        aria-label="查看快捷键"
        title="快捷键 (H)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 10h.01M15 10h.01M9 14h6" />
        </svg>
      </button>

      {/* 帮助面板 */}
      <div className={`keyboard-help ${showHelp ? 'keyboard-help--visible' : ''}`}>
        <div className="keyboard-help__overlay" onClick={() => setShowHelp(false)} />
        <div className="keyboard-help__content">
          <h3>键盘快捷键</h3>
          <dl className="keyboard-help__list">
            <div>
              <dt><kbd>H</kbd></dt>
              <dd>显示此帮助</dd>
            </div>
            <div>
              <dt><kbd>↑</kbd></dt>
              <dd>回到顶部</dd>
            </div>
            <div>
              <dt><kbd>↓</kbd></dt>
              <dd>回到底部</dd>
            </div>
            <div>
              <dt><kbd>1-5</kbd></dt>
              <dd>跳转到各区域</dd>
            </div>
            <div>
              <dt><kbd>ESC</kbd></dt>
              <dd>关闭弹窗</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
