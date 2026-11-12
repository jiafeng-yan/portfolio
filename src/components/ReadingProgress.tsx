import { useEffect, useRef } from 'react';
import './ReadingProgress.css';

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const bar = barRef.current;
      if (!bar) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      // 直接写 transform，不经过 React state：
      // 每个 scroll 事件都 setState 会触发整棵组件树重渲染与样式重算
      bar.style.transform = `scaleX(${progress})`;
      bar.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="reading-progress"
      style={{ transform: 'scaleX(0)' }}
      aria-label="页面阅读进度 0%"
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
