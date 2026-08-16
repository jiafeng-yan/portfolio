import { useEffect, useState } from 'react';
import { soundManager } from '../utils/sound';
import './SoundToggle.css';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(soundManager.isEnabled());
  }, []);

  const toggle = () => {
    const newState = soundManager.toggle();
    setEnabled(newState);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: newState ? '音效已开启' : '音效已关闭',
          type: 'info'
        }
      }));
    }
  };

  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      aria-label={enabled ? '关闭音效' : '开启音效'}
      title={enabled ? '关闭音效' : '开启音效'}
    >
      {enabled ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
        </svg>
      )}
    </button>
  );
}
