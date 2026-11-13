import { useEffect, useState } from 'react';
import './BackToTop.css';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    const footer = document.querySelector('.footer');
    if (!footer || !('IntersectionObserver' in window)) {
      return () => window.removeEventListener('scroll', toggleVisibility);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`back-to-top ${isVisible ? 'back-to-top--visible' : ''} ${isFooterVisible ? 'back-to-top--at-footer' : ''}`}
      onClick={scrollToTop}
      aria-label="返回顶部"
      data-cursor-hover
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
