import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { soundManager } from '../utils/sound';
import './SoundToggle.css';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);

  const controlRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEnabled(soundManager.isEnabled());
    setVolume(soundManager.getVolume());
  }, []);

  useEffect(() => {
    const controlEl = controlRef.current;
    if (!controlEl) return;

    const handleWheel = (event: WheelEvent) => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)').matches
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const delta = event.deltaY < 0 ? 0.05 : -0.05;
      const current = soundManager.isEnabled() ? soundManager.getVolume() : 0;
      const next = soundManager.setVolume(current + delta);
      setVolume(next.volume);
      setEnabled(next.enabled);
      soundManager.playVolumePreview();
    };

    controlEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      controlEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const applyVolume = (ratio: number) => {
    const next = soundManager.setVolume(ratio);
    setVolume(next.volume);
    setEnabled(next.enabled);
    soundManager.playVolumePreview();
  };

  const updateVolumeFromClientY = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    if (rect.height <= 0) return;

    const ratio = (rect.bottom - clientY) / rect.height;
    applyVolume(ratio);
  };

  const handleTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateVolumeFromClientY(event.clientY);
  };

  const handleTrackPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateVolumeFromClientY(event.clientY);
  };

  const handleTrackPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const handleTrackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const baseVolume = enabled ? volume : 0;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault();
      applyVolume(baseVolume + 0.05);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault();
      applyVolume(baseVolume - 0.05);
    } else if (event.key === 'Home') {
      event.preventDefault();
      applyVolume(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      applyVolume(1);
    }
  };

  const toggle = () => {
    if (enabled) soundManager.playClick();

    const newState = soundManager.toggle();
    setEnabled(newState);
    setVolume(soundManager.getVolume());

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

  const effectiveVolume = enabled ? volume : 0;
  const displayPercent = Math.round(effectiveVolume * 100);
  const isMuted = !enabled || effectiveVolume <= 0.005;
  const isLowVolume = !isMuted && effectiveVolume < 0.5;

  return (
    <div
      ref={controlRef}
      className={`sound-control${isDragging ? ' is-dragging' : ''}`}
      data-sound-control
      data-no-magnetic
      data-lenis-prevent
    >
      <div className="sound-control__panel" aria-hidden={false}>
        <span className="sound-control__value">{displayPercent}%</span>
        <div
          ref={trackRef}
          className="sound-control__track"
          role="slider"
          tabIndex={0}
          aria-label="调节交互音效音量"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={displayPercent}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerEnd}
          onPointerCancel={handleTrackPointerEnd}
          onKeyDown={handleTrackKeyDown}
        >
          <div className="sound-control__rail">
            <div
              className="sound-control__fill"
              style={{ height: `${displayPercent}%` }}
            />
            <div
              className="sound-control__thumb"
              style={{ bottom: `${displayPercent}%` }}
            />
          </div>
        </div>
      </div>

      <button
        className="sound-toggle"
        onClick={toggle}
        aria-label={isMuted ? '开启点击与悬停音效' : '关闭点击与悬停音效'}
        aria-pressed={!isMuted}
        title={isMuted ? '点击开启页面交互音效' : `交互音效音量 ${displayPercent}%，悬停可调节，点击关闭`}
      >
        <span className="sound-toggle__icon" aria-hidden="true">
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
            </svg>
          ) : isLowVolume ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" />
            </svg>
          )}
        </span>
        <span className="sound-toggle__copy">交互音效 <strong>{isMuted ? '关闭' : `${displayPercent}%`}</strong></span>
      </button>
    </div>
  );
}
