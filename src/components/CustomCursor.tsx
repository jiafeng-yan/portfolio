import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    if (!cursor || !cursorInner) return;
    
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(cursorInner, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
      });
    };
    
    const handleMouseEnter = () => {
      gsap.to(cursor, { scale: 1.5, duration: 0.3, ease: 'power2.out' });
    };
    
    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power2.out' });
    };
    
    window.addEventListener('mousemove', moveCursor);
    
    // Add hover effects to interactive elements
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };
    
    // Initial setup
    addHoverListeners();
    
    // Re-add listeners when DOM changes (for client:visible components)
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
    };
  }, []);
  
  return (
    <>
      <div
        ref={cursorRef}
        className="cursor-outer"
        style={{
          position: 'fixed',
          width: '40px',
          height: '40px',
          border: '1px solid var(--color-text)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          willChange: 'transform',
          opacity: 1
        }}
      />
      <div
        ref={cursorInnerRef}
        className="cursor-inner"
        style={{
          position: 'fixed',
          width: '6px',
          height: '6px',
          background: 'var(--color-text)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          willChange: 'transform'
        }}
      />
    </>
  );
}
