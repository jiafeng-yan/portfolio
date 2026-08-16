import { useEffect, useState } from 'react';
import './KeyboardShortcuts.css';

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 显示帮助面板：? 或 Shift+/
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // ESC 关闭帮助
      if (e.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      // 数字键导航到各个区域
      const sections = ['hero', 'profile', 'projects', 'skills', 'experience'];
      const num = parseInt(e.key);
      if (num >= 1 && num <= sections.length) {
        e.preventDefault();
        const section = document.querySelector(`[data-section="${sections[num - 1]}"]`);
        section?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // G 然后 H：回到顶部
      if (e.key === 'g' || e.key === 'G') {
        const nextKey = (nextE: KeyboardEvent) => {
          if (nextE.key === 'h' || nextE.key === 'H') {
            nextE.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          window.removeEventListener('keydown', nextKey);
        };
        window.addEventListener('keydown', nextKey, { once: true });
        setTimeout(() => window.removeEventListener('keydown', nextKey), 1000);
        return;
      }

      // G 然后 B：回到底部
      if (e.key === 'g' || e.key === 'G') {
        const nextKey = (nextE: KeyboardEvent) => {
          if (nextE.key === 'b' || nextE.key === 'B') {
            nextE.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
          window.removeEventListener('keydown', nextKey);
        };
        window.addEventListener('keydown', nextKey, { once: true });
        setTimeout(() => window.removeEventListener('keydown', nextKey), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`keyboard-help ${showHelp ? 'keyboard-help--visible' : ''}`}>
      <div className="keyboard-help__overlay" onClick={() => setShowHelp(false)} />
      <div className="keyboard-help__content">
        <h3>键盘快捷键</h3>
        <dl className="keyboard-help__list">
          <div>
            <dt><kbd>?</kbd></dt>
            <dd>显示/隐藏快捷键</dd>
          </div>
          <div>
            <dt><kbd>1-5</kbd></dt>
            <dd>跳转到各区域</dd>
          </div>
          <div>
            <dt><kbd>G</kbd> <kbd>H</kbd></dt>
            <dd>回到顶部</dd>
          </div>
          <div>
            <dt><kbd>G</kbd> <kbd>B</kbd></dt>
            <dd>回到底部</dd>
          </div>
          <div>
            <dt><kbd>ESC</kbd></dt>
            <dd>关闭弹窗</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
