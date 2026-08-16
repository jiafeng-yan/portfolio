import { useEffect, useState } from 'react';
import './ReadingProgress.css';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = (scrolled / total) * 100;
      setProgress(Math.min(100, Math.max(0, percentage)));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className="reading-progress"
      style={{
        transform: `scaleX(${progress / 100})`
      }}
      aria-label={`页面阅读进度 ${Math.round(progress)}%`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
