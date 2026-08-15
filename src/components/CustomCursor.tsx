import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type CursorState = 'default' | 'hover' | 'click' | 'text' | 'link' | 'drag' | 'grab' | 'magnetic';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const lastMousePos = useRef({ x: -1000, y: -1000 });
  const mouseVelocity = useRef({ x: 0, y: 0, speed: 0 });
  const isDragging = useRef(false);
  const dragTarget = useRef<HTMLElement | null>(null);
  const currentMagneticTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768 || window.matchMedia('(hover: none)').matches;
    if (isMobile) return;

    const cursor = cursorRef.current;
    const cursorInner = cursorInnerRef.current;
    if (!cursor || !cursorInner) return;

    // Movement & Velocity deformation
    const moveCursor = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      // Compute velocity
      if (lastMousePos.current.x !== -1000) {
        const vx = x - lastMousePos.current.x;
        const vy = y - lastMousePos.current.y;
        const speed = Math.sqrt(vx * vx + vy * vy);
        mouseVelocity.current = { x: vx, y: vy, speed };

        // Velocity stretch & orientation when moving briskly
        if (speed > 8 && cursorState === 'default' && !currentMagneticTarget.current) {
          const angle = Math.atan2(vy, vx) * (180 / Math.PI);
          const stretch = Math.min(1 + speed * 0.012, 1.45);
          const squeeze = Math.max(1 - speed * 0.008, 0.75);

          gsap.to(cursor, {
            scaleX: stretch,
            scaleY: squeeze,
            rotation: angle,
            duration: 0.12,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        } else if (cursorState === 'default' && !currentMagneticTarget.current) {
          gsap.to(cursor, {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      }

      lastMousePos.current = { x, y };

      // Outer ring - silky spring follow
      gsap.to(cursor, {
        x,
        y,
        duration: 0.14,
        ease: 'power3.out'
      });

      // Inner dot - instant follow
      gsap.to(cursorInner, {
        x,
        y,
        duration: 0.04,
        ease: 'power1.out'
      });

      // Global Spotlight Card Coordinates Tracking
      // Find cards under cursor and update CSS variables without DOM reflow
      const target = e.target as HTMLElement | null;
      const spotlightCard = target?.closest<HTMLElement>('.spotlight-card, [data-spotlight], .project-card, .hero__stats, .profile__row, .skills__item, .recognition-list__group, .experience__item');
      if (spotlightCard) {
        const rect = spotlightCard.getBoundingClientRect();
        const cardX = x - rect.left;
        const cardY = y - rect.top;
        spotlightCard.style.setProperty('--mouse-x', `${cardX}px`);
        spotlightCard.style.setProperty('--mouse-y', `${cardY}px`);
      }

      // Handle Magnetic Pull
      if (currentMagneticTarget.current) {
        const targetRect = currentMagneticTarget.current.getBoundingClientRect();
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;
        const distX = x - centerX;
        const distY = y - centerY;

        gsap.to(currentMagneticTarget.current, {
          x: distX * 0.28,
          y: distY * 0.28,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    };

    // Drag interactions
    const handleDragStart = (e: Event) => {
      const target = e.target as HTMLElement;
      const isDraggable = target.hasAttribute('data-draggable') ||
                          target.closest('[data-draggable]') ||
                          target.classList.contains('github-calendar__scroll-container') ||
                          target.classList.contains('leetcode-calendar__scroll-container');

      if (isDraggable) {
        isDragging.current = true;
        dragTarget.current = target;
        setCursorState('grab');

        gsap.to(cursor, {
          scale: 1.4,
          borderColor: 'var(--color-primary)',
          duration: 0.15,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          scale: 0.3,
          backgroundColor: 'var(--color-primary)',
          duration: 0.15,
          ease: 'power2.out'
        });
      }
    };

    const handleDragMove = (e: PointerEvent) => {
      if (isDragging.current) {
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'power1.out' });
        gsap.to(cursorInner, { x: e.clientX, y: e.clientY, duration: 0.02, ease: 'power1.out' });
      }
    };

    const handleDragEnd = () => {
      if (isDragging.current) {
        isDragging.current = false;
        dragTarget.current = null;
        setCursorState('default');

        gsap.to(cursor, {
          scale: 1,
          borderColor: 'var(--color-text)',
          duration: 0.25,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          scale: 1,
          backgroundColor: 'var(--color-text)',
          duration: 0.25,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isDraggable = target.hasAttribute('data-draggable') ||
                          target.closest('[data-draggable]') ||
                          target.classList.contains('github-calendar__scroll-container') ||
                          target.classList.contains('leetcode-calendar__scroll-container');

      if (isDraggable) {
        handleDragStart(e);
      } else {
        setCursorState('click');
        gsap.to(cursor, { scale: 0.85, duration: 0.1, ease: 'power2.out' });
        gsap.to(cursorInner, { scale: 2, duration: 0.1, ease: 'power2.out' });
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        handleDragEnd();
      } else {
        setCursorState('default');
        gsap.to(cursor, { scale: 1, duration: 0.2, ease: 'power2.out' });
        gsap.to(cursorInner, { scale: 1, duration: 0.2, ease: 'power2.out' });
      }
    };

    // Hover targeting
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const isLink = target.tagName === 'A' || target.closest('a');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isText = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      const isDraggable = target.hasAttribute('data-draggable') ||
                          target.closest('[data-draggable]') ||
                          target.classList.contains('github-calendar__scroll-container') ||
                          target.classList.contains('leetcode-calendar__scroll-container');
      const isMagnetic = target.hasAttribute('data-magnetic') || target.closest('[data-magnetic]') || isLink || isButton;

      if (isMagnetic) {
        currentMagneticTarget.current = (target.hasAttribute('data-magnetic') ? target : target.closest('a, button, [data-magnetic]')) as HTMLElement;
      }

      if (isLink) {
        setCursorState('link');
        gsap.to(cursor, {
          scale: 1.7,
          borderColor: 'var(--color-primary)',
          duration: 0.22,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          scale: 0.5,
          backgroundColor: 'var(--color-primary)',
          duration: 0.22,
          ease: 'power2.out'
        });
      } else if (isDraggable && !isDragging.current) {
        setCursorState('grab');
        gsap.to(cursor, {
          scale: 1.5,
          borderColor: 'var(--color-primary)',
          duration: 0.22,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          scale: 0.4,
          backgroundColor: 'var(--color-primary)',
          duration: 0.22,
          ease: 'power2.out'
        });
      } else if (isButton || target.hasAttribute('data-cursor-hover')) {
        setCursorState('hover');
        gsap.to(cursor, {
          scale: 1.5,
          borderColor: 'var(--color-text)',
          duration: 0.22,
          ease: 'power2.out'
        });
        gsap.to(cursorInner, {
          scale: 0.6,
          duration: 0.22,
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

    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (currentMagneticTarget.current) {
        gsap.to(currentMagneticTarget.current, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'elastic.out(1, 0.4)'
        });
        currentMagneticTarget.current = null;
      }

      setCursorState('default');
      gsap.to(cursor, {
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        borderColor: 'var(--color-text)',
        borderRadius: '50%',
        duration: 0.25,
        ease: 'power2.out'
      });
      gsap.to(cursorInner, {
        scale: 1,
        backgroundColor: 'var(--color-text)',
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('pointermove', handleDragMove, { passive: true });
    window.addEventListener('pointerup', handleDragEnd, { passive: true });

    // Add listeners to interactive elements
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, [data-cursor-hover], [data-magnetic], input, textarea, [contenteditable="true"], [data-draggable], .github-calendar__scroll-container, .leetcode-calendar__scroll-container'
      );
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter, { passive: true });
        el.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      });
    };

    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', handleDragEnd);
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
          willChange: 'transform, border-color, border-radius, opacity',
          opacity: 1
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
