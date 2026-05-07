import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type CursorState = 'default' | 'hover' | 'click' | 'text' | 'link';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    if (!cursor || !cursorInner) return;

    // Faster, more responsive cursor movement
    const moveCursor = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Outer ring - smooth but quick follow
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power3.out'
      });

      // Inner dot - instant follow
      gsap.to(cursorInner, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.05,
        ease: 'power1.out'
      });
    };

    const handleMouseDown = () => {
      setCursorState('click');
      gsap.to(cursor, { scale: 0.85, duration: 0.1, ease: 'power2.out' });
      gsap.to(cursorInner, { scale: 2, duration: 0.1, ease: 'power2.out' });
    };

    const handleMouseUp = () => {
      setCursorState('default');
      gsap.to(cursor, { scale: 1, duration: 0.2, ease: 'power2.out' });
      gsap.to(cursorInner, { scale: 1, duration: 0.2, ease: 'power2.out' });
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const isLink = target.tagName === 'A' || target.closest('a');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isText = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isLink) {
        setCursorState('link');
        gsap.to(cursor, {
          scale: 1.8,
          borderColor: 'var(--color-primary)',
          duration: 0.25,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          scale: 0.5,
          backgroundColor: 'var(--color-primary)',
          duration: 0.25,
          ease: 'power2.out'
        });
      } else if (isButton || target.hasAttribute('data-cursor-hover')) {
        setCursorState('hover');
        gsap.to(cursor, {
          scale: 1.6,
          borderColor: 'var(--color-text)',
          duration: 0.25,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          scale: 0.6,
          duration: 0.25,
          ease: 'power2.out'
        });
      } else if (isText) {
        setCursorState('text');
        gsap.to(cursor, {
          scaleX: 0.2,
          scaleY: 1.5,
          borderRadius: '2px',
          duration: 0.2,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          opacity: 0,
          duration: 0.15
        });
      }
    };

    const handleMouseLeave = () => {
      setCursorState('default');
      gsap.to(cursor, {
        scale: 1,
        borderColor: 'var(--color-text)',
        borderRadius: '50%',
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(cursorInner, {
        scale: 1,
        backgroundColor: 'var(--color-text)',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Add hover effects to interactive elements
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover], input, textarea, [contenteditable="true"]');
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
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
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
          width: '36px',
          height: '36px',
          border: '1.5px solid var(--color-text)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          willChange: 'transform, border-color, border-radius',
          opacity: 1,
          transition: 'width 0.2s, height 0.2s'
        }}
      />
      <div
        ref={cursorInnerRef}
        className="cursor-inner"
        style={{
          position: 'fixed',
          width: '5px',
          height: '5px',
          background: 'var(--color-text)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
          willChange: 'transform, background-color, opacity'
        }}
      />
    </>
  );
}
