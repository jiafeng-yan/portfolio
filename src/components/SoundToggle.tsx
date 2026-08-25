import { useEffect, useState } from 'react';
import { soundManager } from '../utils/sound';
import './SoundToggle.css';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(soundManager.isEnabled());
  }, []);

  const toggle = () => {
    if (enabled) soundManager.playClick();

    const newState = soundManager.toggle();
    setEnabled(newState);

    if (newState) soundManager.playSuccess();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: newState
            ? '交互音效已开启：点击与悬停会有轻提示音'
            : '交互音效已关闭',
          type: 'info'
        }
      }));
    }
  };

  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      aria-label={enabled ? '关闭点击与悬停音效' : '开启点击与悬停音效'}
      aria-pressed={enabled}
      title={enabled ? '点击与悬停音效已开启，点击关闭' : '点击开启页面交互音效'}
      data-sound-control
    >
      <span className="sound-toggle__icon" aria-hidden="true">
        {enabled ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
          </svg>
        )}
      </span>
      <span className="sound-toggle__copy">交互音效 <strong>{enabled ? '开启' : '关闭'}</strong></span>
    </button>
  );
}
