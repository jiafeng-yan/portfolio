import { useCallback, useEffect, useRef, useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { soundManager } from '../utils/sound';

interface ProjectLink {
  type: 'github' | 'arxiv' | 'paper' | 'demo';
  url: string;
}

interface Project {
  id: string;
  title: string;
  subtitle: string;
  venue: string;
  period?: string;
  description: string;
  technologies: string[];
  highlights?: string[];
  links?: ProjectLink[];
  status?: string;
}

interface ProjectGroup {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  projects: Project[];
}

interface Props {
  groups: ProjectGroup[];
}

interface LeavingState {
  index: number;
  direction: 'next' | 'prev';
  isWrap: boolean;
  startX: number;
  startRot: number;
}

interface WrapNotice {
  text: string;
  key: number;
}

const MOBILE_DECK_QUERY = '(max-width: 900px)';
const DRAG_LOCK_PX = 10;
const SWIPE_DISTANCE_PX = 46;
const SWIPE_VELOCITY = 0.32;
const NORMAL_LEAVE_MS = 280;
const WRAP_LEAVE_MS = 440;
const WRAP_NOTICE_MS = 1800;

function formatIndex(value: number) {
  return String(value).padStart(2, '0');
}

function getRestingTransform(depth: number, total: number, dragProgress: number, isPullTarget: boolean) {
  if (depth === 0) {
    return { y: 0, scale: 1, opacity: 1 };
  }
  if (isPullTarget) {
    const y = 8 * (1 - dragProgress);
    const scale = 0.965 + 0.035 * dragProgress;
    return { y, scale, opacity: 1 };
  }
  if (depth === 1) {
    const y = 9 - 9 * dragProgress;
    const scale = 0.96 + 0.04 * dragProgress;
    return { y, scale, opacity: 1 };
  }
  if (depth === 2 && total >= 3) {
    const y = 18 - 9 * dragProgress;
    const scale = 0.92 + 0.04 * dragProgress;
    return { y, scale, opacity: 0.96 };
  }
  return { y: 22, scale: 0.9, opacity: 0 };
}

function useIsMobileDeck() {
  const [isMobileDeck, setIsMobileDeck] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_DECK_QUERY);
    const update = () => setIsMobileDeck(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isMobileDeck;
}

function ProjectDeckPanel({
  group,
  isMobileDeck
}: {
  group: ProjectGroup;
  isMobileDeck: boolean;
}) {
  const total = group.projects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [leaving, setLeaving] = useState<LeavingState | null>(null);
  const [wrapNotice, setWrapNotice] = useState<WrapNotice | null>(null);

  const cardsRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leaveTimerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const gestureRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    lock: 'none' | 'horizontal' | 'vertical';
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    lock: 'none'
  });

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current !== null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const clearNoticeTimer = useCallback(() => {
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLeaveTimer();
      clearNoticeTimer();
    };
  }, [clearLeaveTimer, clearNoticeTimer]);

  // 切换到桌面端时清理移动端状态，避免残留 inline 状态
  useEffect(() => {
    if (!isMobileDeck) {
      clearLeaveTimer();
      clearNoticeTimer();
      setDrawerOpen(false);
      setDragX(0);
      setIsDragging(false);
      setLeaving(null);
      setWrapNotice(null);
    }
  }, [isMobileDeck, clearLeaveTimer, clearNoticeTimer]);

  // 控制背景垫卡的 inert，避免桌面与移动端无障碍焦点错位
  useEffect(() => {
    slotRefs.current.forEach((slotEl, index) => {
      if (!slotEl) return;
      slotEl.inert = isMobileDeck && index !== activeIndex;
    });
  }, [isMobileDeck, activeIndex, total]);

  const stepDeck = useCallback(
    (direction: 'next' | 'prev', startX = 0, startRot = 0) => {
      if (total <= 1) return;

      clearLeaveTimer();
      const nextIndex =
        direction === 'next'
          ? (activeIndex + 1) % total
          : (activeIndex - 1 + total) % total;

      const isWrap =
        (direction === 'next' && activeIndex === total - 1) ||
        (direction === 'prev' && activeIndex === 0);

      setLeaving({
        index: activeIndex,
        direction,
        isWrap,
        startX,
        startRot
      });
      setActiveIndex(nextIndex);
      setDragX(0);
      setIsDragging(false);
      setDrawerOpen(false);
      soundManager.playCardFlip(direction);

      if (isWrap) {
        clearNoticeTimer();
        setWrapNotice({
          text:
            direction === 'next'
              ? '↺ 已回到第 01 项'
              : `↺ 已切回第 ${formatIndex(total)} 项`,
          key: Date.now()
        });
        noticeTimerRef.current = window.setTimeout(() => {
          setWrapNotice(null);
          noticeTimerRef.current = null;
        }, WRAP_NOTICE_MS);
      } else {
        clearNoticeTimer();
        setWrapNotice(null);
      }

      const duration = isWrap ? WRAP_LEAVE_MS : NORMAL_LEAVE_MS;
      leaveTimerRef.current = window.setTimeout(() => {
        setLeaving(null);
        leaveTimerRef.current = null;
      }, duration);
    },
    [activeIndex, total, clearLeaveTimer, clearNoticeTimer]
  );

  const jumpToCard = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= total) return;
      setDrawerOpen(false);
      if (targetIndex === activeIndex) return;

      clearLeaveTimer();
      clearNoticeTimer();
      setLeaving(null);
      setWrapNotice(null);
      setDragX(0);
      setIsDragging(false);
      setActiveIndex(targetIndex);
    },
    [activeIndex, total, clearLeaveTimer, clearNoticeTimer]
  );

  const resetDrag = useCallback(() => {
    gestureRef.current.pointerId = null;
    gestureRef.current.lock = 'none';
    setIsDragging(false);
    setDragX(0);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobileDeck || total <= 1) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('a, button')) return;

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      lastX: event.clientX,
      lock: 'none'
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!isMobileDeck || gesture.pointerId !== event.pointerId) return;

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    gesture.lastX = event.clientX;

    if (gesture.lock === 'vertical') return;

    if (gesture.lock === 'none') {
      if (Math.abs(dy) > DRAG_LOCK_PX && Math.abs(dy) >= Math.abs(dx)) {
        gesture.lock = 'vertical';
        return;
      }
      if (Math.abs(dx) > DRAG_LOCK_PX && Math.abs(dx) > Math.abs(dy) * 1.15) {
        gesture.lock = 'horizontal';
        setIsDragging(true);
        try {
          cardsRef.current?.setPointerCapture(event.pointerId);
        } catch {
          // 忽略合成事件下不支持 setPointerCapture 的情况
        }
      } else {
        return;
      }
    }

    event.preventDefault();
    const clampedDx = Math.max(-220, Math.min(220, dx));
    setDragX(clampedDx);
  };

  const finishGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!isMobileDeck || gesture.pointerId !== event.pointerId) return;

    if (gesture.lock === 'horizontal') {
      const dx = event.clientX - gesture.startX;
      const elapsed = Math.max(16, performance.now() - gesture.startTime);
      const velocity = Math.abs(dx) / elapsed;
      const shouldCommit =
        Math.abs(dx) >= SWIPE_DISTANCE_PX ||
        (velocity >= SWIPE_VELOCITY && Math.abs(dx) >= 24);

      if (shouldCommit) {
        const direction: 'next' | 'prev' = dx < 0 ? 'next' : 'prev';
        const rot = Math.max(-6, Math.min(6, dx * 0.03));
        gestureRef.current.pointerId = null;
        gestureRef.current.lock = 'none';
        stepDeck(direction, dx, rot);
        return;
      }
    }

    resetDrag();
  };

  const handleDeckKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isMobileDeck || total <= 1) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepDeck('next');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepDeck('prev');
    }
  };

  const dragProgress = isDragging ? Math.min(1, Math.abs(dragX) / 140) : 0;
  const activeRotation = isDragging ? Math.max(-6, Math.min(6, dragX * 0.03)) : 0;
  const isPullingRight = isDragging && dragX > 4;

  const boundaryHint = wrapNotice
    ? wrapNotice.text
    : activeIndex === 0
      ? '首项'
      : activeIndex === total - 1
        ? '末项 · 再滑循环'
        : '';

  return (
    <section
      className="project-showcase__panel spotlight-card"
      data-spotlight
      aria-labelledby={`${group.id}-title`}
    >
      <header className="project-showcase__header">
        <div>
          <span className="project-showcase__eyebrow">{group.eyebrow}</span>
          <h3 id={`${group.id}-title`}>{group.title}</h3>
        </div>
        <span className="project-showcase__count">{total}</span>
        {total > 1 && (
          <button
            type="button"
            className="project-showcase__index-toggle"
            aria-expanded={drawerOpen}
            aria-controls={`${group.id}-drawer`}
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            <span>目录 · {total}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className={drawerOpen ? 'is-open' : undefined}
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </header>

      <p className="project-showcase__summary">{group.summary}</p>

      {total > 1 && (
        <div
          id={`${group.id}-drawer`}
          className={`project-deck__drawer${drawerOpen ? ' is-open' : ''}`}
          aria-hidden={!drawerOpen}
        >
          <div className="project-deck__drawer-inner">
            <ul className="project-deck__drawer-list">
              {group.projects.map((project, index) => {
                const isCurrent = index === activeIndex;
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={`project-deck__drawer-item${isCurrent ? ' is-active' : ''}`}
                      tabIndex={drawerOpen ? 0 : -1}
                      onClick={() => jumpToCard(index)}
                    >
                      <span className="project-deck__drawer-num">{formatIndex(index + 1)}</span>
                      <span className="project-deck__drawer-title">{project.title}</span>
                      {project.status && (
                        <span className="project-deck__drawer-status">{project.status}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div
        ref={cardsRef}
        className={`project-showcase__cards${isMobileDeck ? ' is-deck-active' : ''}`}
        role={isMobileDeck ? 'region' : undefined}
        aria-roledescription={isMobileDeck ? '可循环项目卡堆' : undefined}
        aria-label={isMobileDeck ? `${group.title}卡堆，当前第 ${activeIndex + 1} 项，共 ${total} 项` : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={resetDrag}
        onKeyDown={handleDeckKeyDown}
      >
        {group.projects.map((project, index) => {
          const depth = (index - activeIndex + total) % total;
          const isLeavingThis = leaving?.index === index;
          const isPullTarget = isPullingRight && depth === total - 1;
          const targetRest = getRestingTransform(depth, total, 0, false);

          let depthTag = 'hidden';
          if (depth === 0) depthTag = '0';
          else if (depth === 1) depthTag = '1';
          else if (depth === 2 && total >= 3) depthTag = '2';

          let slotClass = 'project-deck__slot';
          if (isMobileDeck && isLeavingThis && leaving) {
            if (leaving.isWrap) {
              slotClass +=
                leaving.direction === 'next'
                  ? ' project-deck__slot--wrap-next'
                  : ' project-deck__slot--wrap-prev';
            } else {
              slotClass +=
                leaving.direction === 'next'
                  ? ' project-deck__slot--leave-next'
                  : ' project-deck__slot--leave-prev';
            }
          } else if (isMobileDeck && isDragging && depth === 0) {
            slotClass += ' project-deck__slot--dragging';
          }

          let slotStyle: React.CSSProperties | undefined;
          if (isMobileDeck) {
            if (isLeavingThis && leaving) {
              slotStyle = {
                '--leave-start-x': `${leaving.startX}px`,
                '--leave-start-rot': `${leaving.startRot}deg`,
                '--settle-y': `${targetRest.y}px`,
                '--settle-scale': targetRest.scale,
                '--settle-opacity': targetRest.opacity
              } as React.CSSProperties;
            } else if (depth === 0) {
              slotStyle = {
                zIndex: total + 2,
                opacity: 1,
                transform: isDragging
                  ? `translate3d(${dragX}px, ${-Math.min(6, Math.abs(dragX) * 0.035)}px, 0) rotate(${activeRotation}deg)`
                  : 'translate3d(0, 0, 0) scale(1)',
                pointerEvents: 'auto'
              };
            } else if (isPullTarget) {
              const pullRest = getRestingTransform(depth, total, dragProgress, true);
              slotStyle = {
                zIndex: total + 1,
                opacity: pullRest.opacity,
                transform: `translate3d(0, ${pullRest.y}px, 0) scale(${pullRest.scale})`,
                pointerEvents: 'none'
              };
            } else {
              const rest = getRestingTransform(depth, total, dragProgress, false);
              slotStyle = {
                zIndex: Math.max(1, total - depth),
                opacity: rest.opacity,
                transform: `translate3d(0, ${rest.y}px, 0) scale(${rest.scale})`,
                pointerEvents: 'none'
              };
            }
          }

          return (
            <div
              key={project.id}
              ref={(el) => {
                slotRefs.current[index] = el;
              }}
              className={slotClass}
              data-deck-depth={isMobileDeck ? depthTag : undefined}
              aria-hidden={isMobileDeck ? index !== activeIndex : undefined}
              style={slotStyle}
            >
              <ProjectCard project={project} />
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <div className="project-deck__controls">
          <button
            type="button"
            className="project-deck__nav"
            aria-label={`上一个${group.title}`}
            data-sound-flip
            onClick={() => stepDeck('prev')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3.5L5.5 8L10 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="project-deck__status">
            <div className="project-deck__meta">
              <span className="project-deck__counter">
                {formatIndex(activeIndex + 1)} / {formatIndex(total)}
              </span>
              {boundaryHint && (
                <span
                  key={wrapNotice ? wrapNotice.key : boundaryHint}
                  className={`project-deck__boundary${wrapNotice ? ' is-wrap' : ''}`}
                >
                  {boundaryHint}
                </span>
              )}
            </div>

            <div className="project-deck__segments" role="tablist" aria-label={`${group.title}序号导航`}>
              {group.projects.map((project, index) => {
                const isCurrent = index === activeIndex;
                return (
                  <button
                    key={project.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`第 ${index + 1} 项：${project.title}`}
                    className={`project-deck__segment${isCurrent ? ' is-active' : ''}`}
                    onClick={() => jumpToCard(index)}
                  >
                    <span className="project-deck__segment-bar" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="project-deck__nav"
            aria-label={`下一个${group.title}`}
            data-sound-flip
            onClick={() => stepDeck('next')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 3.5L10.5 8L6 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

export function ProjectShowcase({ groups }: Props) {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement[]>([]);
  const isMobileDeck = useIsMobileDeck();

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase) return;

    const supportsHas = CSS.supports('selector(:has(*))');

    if (!supportsHas) {
      const panels = showcase.querySelectorAll<HTMLDivElement>('.project-showcase__panel');
      panelsRef.current = Array.from(panels);

      const handlers: Map<HTMLDivElement, { enter: () => void; leave: () => void }> = new Map();

      const handlePanelHover = (panel: HTMLDivElement, isHovering: boolean) => {
        const otherPanel = panelsRef.current.find((p) => p !== panel);

        if (isHovering) {
          panel.style.flexBasis = 'calc((100% - var(--showcase-gap)) * 0.62)';
          panel.style.background = 'rgba(255, 255, 255, 0.86)';
          panel.style.borderColor = 'rgba(26, 26, 26, 0.32)';
          panel.style.transform = 'translateY(-4px)';
          panel.style.opacity = '1';

          if (otherPanel) {
            otherPanel.style.flexBasis = 'calc((100% - var(--showcase-gap)) * 0.38)';
            otherPanel.style.opacity = '0.72';
            otherPanel.style.transform = 'translateY(3px)';
          }
        } else {
          panelsRef.current.forEach((p) => {
            p.style.flexBasis = 'calc((100% - var(--showcase-gap)) / 2)';
            p.style.background = 'rgba(255, 255, 255, 0.58)';
            p.style.borderColor = 'rgba(0, 0, 0, 0.12)';
            p.style.transform = 'translateY(0)';
            p.style.opacity = '1';
          });
        }
      };

      panelsRef.current.forEach((panel) => {
        const enterHandler = () => handlePanelHover(panel, true);
        const leaveHandler = () => handlePanelHover(panel, false);
        handlers.set(panel, { enter: enterHandler, leave: leaveHandler });

        panel.addEventListener('mouseenter', enterHandler);
        panel.addEventListener('mouseleave', leaveHandler);
        panel.addEventListener('focusin', enterHandler);
        panel.addEventListener('focusout', leaveHandler);
      });

      return () => {
        panelsRef.current.forEach((panel) => {
          const handler = handlers.get(panel);
          if (handler) {
            panel.removeEventListener('mouseenter', handler.enter);
            panel.removeEventListener('mouseleave', handler.leave);
            panel.removeEventListener('focusin', handler.enter);
            panel.removeEventListener('focusout', handler.leave);
          }
        });
      };
    }
  }, []);

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase) return;

    const getPixelDelta = (event: WheelEvent, fallbackElement: HTMLElement) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * fallbackElement.clientHeight;
      return event.deltaY;
    };

    const handlePanelWheel = (event: WheelEvent) => {
      if (window.matchMedia('(max-width: 900px)').matches) return;
      if (event.ctrlKey) return;

      const target = event.target instanceof Element ? event.target : null;
      const panel = target?.closest<HTMLElement>('.project-showcase__panel');
      if (!panel || !showcase.contains(panel)) return;

      const cards = panel.querySelector<HTMLDivElement>('.project-showcase__cards');
      if (!cards) return;

      const maxScroll = cards.scrollHeight - cards.clientHeight;
      if (maxScroll <= 1) return;

      const deltaY = getPixelDelta(event, cards);
      if (deltaY === 0) return;

      // 指针在项目面板内且列表可滚时始终接管滚轮：到头后停在原地，不向主页面溢出
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      cards.scrollTop = Math.min(maxScroll, Math.max(0, cards.scrollTop + deltaY));
    };

    showcase.addEventListener('wheel', handlePanelWheel, { passive: false, capture: true });

    return () => {
      showcase.removeEventListener('wheel', handlePanelWheel, { capture: true });
    };
  }, []);

  return (
    <div ref={showcaseRef} className="project-showcase">
      {groups.map((group) => (
        <ProjectDeckPanel key={group.id} group={group} isMobileDeck={isMobileDeck} />
      ))}

      <style>{`
        .project-showcase {
          display: flex;
          --showcase-gap: clamp(1.25rem, 2vw, var(--space-lg));
          gap: var(--showcase-gap);
          align-items: stretch;
          min-width: 0;
        }

        .project-showcase__panel {
          flex: 0 0 calc((100% - var(--showcase-gap)) / 2);
          min-width: 0;
          height: clamp(560px, 70vh, 720px);
          padding: var(--space-lg);
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: var(--border-radius);
          background: rgba(255, 255, 255, 0.74);
          display: flex;
          flex-direction: column;
          transition:
            flex-basis 0.78s cubic-bezier(0.19, 1, 0.22, 1),
            opacity 0.62s cubic-bezier(0.19, 1, 0.22, 1),
            transform 0.62s cubic-bezier(0.19, 1, 0.22, 1),
            border-color 0.46s var(--ease-out-expo),
            background 0.46s var(--ease-out-expo);
          will-change: flex-basis, transform, opacity;
          backface-visibility: hidden;
          outline: none;
          overflow: hidden;
        }

        /* Modern browsers with :has() support */
        @supports selector(:has(*)) {
          .project-showcase:has(.project-showcase__panel:first-child:hover) .project-showcase__panel:first-child,
          .project-showcase:has(.project-showcase__panel:first-child:focus-within) .project-showcase__panel:first-child,
          .project-showcase:has(.project-showcase__panel:nth-child(2):hover) .project-showcase__panel:nth-child(2),
          .project-showcase:has(.project-showcase__panel:nth-child(2):focus-within) .project-showcase__panel:nth-child(2) {
            flex-basis: calc((100% - var(--showcase-gap)) * 0.62);
            background: rgba(255, 255, 255, 0.86);
            border-color: rgba(26, 26, 26, 0.32);
            transform: translateY(-4px);
          }

          .project-showcase:has(.project-showcase__panel:first-child:hover) .project-showcase__panel:nth-child(2),
          .project-showcase:has(.project-showcase__panel:first-child:focus-within) .project-showcase__panel:nth-child(2),
          .project-showcase:has(.project-showcase__panel:nth-child(2):hover) .project-showcase__panel:first-child,
          .project-showcase:has(.project-showcase__panel:nth-child(2):focus-within) .project-showcase__panel:first-child {
            flex-basis: calc((100% - var(--showcase-gap)) * 0.38);
            opacity: 0.72;
            transform: translateY(3px);
          }
        }

        .project-showcase__panel:focus-within {
          border-color: rgba(26, 26, 26, 0.45);
        }

        .project-showcase__header {
          display: flex;
          justify-content: space-between;
          gap: var(--space-lg);
          align-items: start;
          margin-bottom: var(--space-md);
        }

        .project-showcase__eyebrow {
          display: block;
          margin-bottom: var(--space-xs);
          color: var(--color-primary-ink);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
        }

        .project-showcase__header h3 {
          font-size: clamp(1.3rem, 2vw, 1.75rem);
        }

        .project-showcase__count {
          min-width: 2.1rem;
          height: 2.1rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 999px;
          font-size: 0.78rem;
          color: var(--color-text-subtle);
        }

        .project-showcase__index-toggle,
        .project-deck__drawer,
        .project-deck__controls {
          display: none;
        }

        .project-deck__slot {
          display: contents;
        }

        .project-showcase__summary {
          color: var(--color-text-muted);
          font-size: 0.92rem;
          line-height: 1.85;
          margin-bottom: var(--space-md);
          max-width: 64rem;
          text-wrap: pretty;
        }

        .project-showcase__cards {
          display: grid;
          gap: var(--space-md);
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior-y: contain;
          padding-right: var(--space-sm);
          scrollbar-width: thin;
          scrollbar-color: rgba(160, 160, 160, 0.42) transparent;
          transition: opacity 0.35s var(--ease-out-expo), transform 0.45s var(--ease-out-expo);
        }

        @supports not selector(:has(*)) {
          .project-showcase__panel:hover,
          .project-showcase__panel:focus-within {
            background: rgba(255, 255, 255, 0.86);
            border-color: rgba(26, 26, 26, 0.32);
          }
        }

        .project-showcase__cards::-webkit-scrollbar {
          width: 6px;
        }

        .project-showcase__cards::-webkit-scrollbar-track {
          background: transparent;
        }

        .project-showcase__cards::-webkit-scrollbar-thumb {
          background: rgba(160, 160, 160, 0.36);
          border-radius: 999px;
        }

        .project-showcase__panel:hover .project-showcase__cards,
        .project-showcase__panel:focus-within .project-showcase__cards {
          transform: translateY(-2px);
        }

        @supports selector(:has(*)) {
          .project-showcase:has(.project-showcase__panel:first-child:hover) .project-showcase__panel:nth-child(2) .project-showcase__cards,
          .project-showcase:has(.project-showcase__panel:first-child:focus-within) .project-showcase__panel:nth-child(2) .project-showcase__cards,
          .project-showcase:has(.project-showcase__panel:nth-child(2):hover) .project-showcase__panel:first-child .project-showcase__cards,
          .project-showcase:has(.project-showcase__panel:nth-child(2):focus-within) .project-showcase__panel:first-child .project-showcase__cards {
            opacity: 0.72;
            transform: translateX(4px);
          }
        }

        @media (max-width: 900px) {
          .project-showcase {
            display: grid;
            grid-template-columns: 1fr;
          }

          .project-showcase__panel,
          .project-showcase:has(.project-showcase__panel:first-child:hover) .project-showcase__panel:first-child,
          .project-showcase:has(.project-showcase__panel:first-child:hover) .project-showcase__panel:nth-child(2),
          .project-showcase:has(.project-showcase__panel:nth-child(2):hover) .project-showcase__panel:first-child,
          .project-showcase:has(.project-showcase__panel:nth-child(2):hover) .project-showcase__panel:nth-child(2),
          .project-showcase:has(.project-showcase__panel:first-child:focus-within) .project-showcase__panel:first-child,
          .project-showcase:has(.project-showcase__panel:first-child:focus-within) .project-showcase__panel:nth-child(2),
          .project-showcase:has(.project-showcase__panel:nth-child(2):focus-within) .project-showcase__panel:first-child,
          .project-showcase:has(.project-showcase__panel:nth-child(2):focus-within) .project-showcase__panel:nth-child(2) {
            width: 100%;
            max-width: 100%;
            flex-basis: auto;
            height: auto;
            max-height: none;
            opacity: 1;
            transform: none;
            background: rgba(255, 255, 255, 0.74);
            border-color: rgba(0, 0, 0, 0.12);
          }

          .project-showcase__panel {
            overflow: hidden;
            overflow: clip;
          }

          .project-showcase__panel:hover .project-showcase__cards,
          .project-showcase__panel:focus-within .project-showcase__cards,
          .project-showcase:has(.project-showcase__panel:first-child:hover) .project-showcase__panel:nth-child(2) .project-showcase__cards,
          .project-showcase:has(.project-showcase__panel:first-child:focus-within) .project-showcase__panel:nth-child(2) .project-showcase__cards,
          .project-showcase:has(.project-showcase__panel:nth-child(2):hover) .project-showcase__panel:first-child .project-showcase__cards,
          .project-showcase:has(.project-showcase__panel:nth-child(2):focus-within) .project-showcase__panel:first-child .project-showcase__cards {
            opacity: 1;
            transform: none;
          }

          .project-showcase__count {
            display: none;
          }

          .project-showcase__index-toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            min-height: 2rem;
            padding: 0.3rem 0.7rem;
            border: 1px solid rgba(44, 40, 37, 0.14);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.78);
            color: var(--color-text-muted);
            font-family: var(--font-mono);
            font-size: 0.74rem;
            font-weight: 500;
            white-space: nowrap;
            cursor: pointer;
            transition: border-color var(--duration-fast), background var(--duration-fast), color var(--duration-fast);
          }

          .project-showcase__index-toggle[aria-expanded='true'] {
            border-color: rgba(156, 91, 56, 0.38);
            background: rgba(156, 91, 56, 0.09);
            color: var(--color-primary-ink);
          }

          .project-showcase__index-toggle svg {
            transition: transform 220ms var(--ease-out-expo);
          }

          .project-showcase__index-toggle svg.is-open {
            transform: rotate(180deg);
          }

          .project-deck__drawer {
            display: grid;
            grid-template-rows: 0fr;
            opacity: 0;
            margin-bottom: 0;
            transition:
              grid-template-rows 260ms var(--ease-out-expo),
              opacity 200ms ease,
              margin-bottom 260ms var(--ease-out-expo);
          }

          .project-deck__drawer.is-open {
            grid-template-rows: 1fr;
            opacity: 1;
            margin-bottom: var(--space-md);
          }

          .project-deck__drawer-inner {
            overflow: hidden;
          }

          .project-deck__drawer-list {
            list-style: none;
            margin: 0;
            padding: 0.35rem;
            display: grid;
            gap: 0.25rem;
            border: 1px solid rgba(44, 40, 37, 0.1);
            border-radius: var(--border-radius);
            background: rgba(248, 246, 243, 0.92);
          }

          .project-deck__drawer-item {
            width: 100%;
            display: grid;
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            gap: 0.55rem;
            padding: 0.52rem 0.65rem;
            border: 0;
            border-radius: 6px;
            background: transparent;
            color: var(--color-text-muted);
            text-align: left;
            font-size: 0.82rem;
            line-height: 1.35;
            cursor: pointer;
            transition: background var(--duration-fast), color var(--duration-fast);
          }

          .project-deck__drawer-item.is-active {
            background: rgba(156, 91, 56, 0.11);
            color: var(--color-text);
            font-weight: 500;
          }

          .project-deck__drawer-num {
            font-family: var(--font-mono);
            font-size: 0.72rem;
            color: var(--color-primary-ink);
          }

          .project-deck__drawer-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .project-deck__drawer-status {
            padding: 2px 7px;
            border-radius: 999px;
            background: rgba(122, 155, 184, 0.15);
            color: var(--color-accent-cool-ink);
            font-size: 0.66rem;
            font-weight: 600;
            white-space: nowrap;
          }

          .project-showcase__cards {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 0;
            padding: 2px 0 22px;
            overflow: visible;
            position: relative;
            isolation: isolate;
            touch-action: pan-y;
            user-select: none;
          }

          .project-deck__slot {
            display: block;
            grid-area: 1 / 1;
            min-width: 0;
            height: 100%;
            transform-origin: center bottom;
            will-change: transform, opacity;
            transition:
              transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 240ms ease;
          }

          .project-deck__slot--dragging {
            transition: none;
          }

          .project-deck__slot--leave-next {
            z-index: 30;
            pointer-events: none;
            animation: deckLeaveNext 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          .project-deck__slot--leave-prev {
            z-index: 30;
            pointer-events: none;
            animation: deckLeavePrev 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          .project-deck__slot--wrap-next {
            z-index: 30;
            pointer-events: none;
            animation: deckWrapNext 440ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          .project-deck__slot--wrap-prev {
            z-index: 30;
            pointer-events: none;
            animation: deckWrapPrev 440ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          .project-showcase__panel .project-deck__slot .project-card {
            height: 100%;
            display: flex;
            flex-direction: column;
            user-select: text;
          }

          .project-showcase__panel .project-deck__slot .project-card__content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .project-showcase__panel .project-deck__slot .project-card__footer {
            margin-top: auto;
          }

          /* 实体叠卡分层：每张垫卡用不透明暖纸色，杜绝底层文本透视重影 */
          .project-showcase__panel .project-deck__slot[data-deck-depth='0'] .project-card,
          .project-showcase__panel .project-deck__slot[data-deck-depth='0'] .project-card:hover {
            background: #fcfaf7;
            border-color: rgba(44, 40, 37, 0.14);
            box-shadow: 0 10px 26px rgba(44, 40, 37, 0.08), 0 1px 2px rgba(44, 40, 37, 0.04);
          }

          .project-showcase__panel .project-deck__slot[data-deck-depth='1'] .project-card,
          .project-showcase__panel .project-deck__slot[data-deck-depth='1'] .project-card:hover {
            background: #f4efe8;
            border-color: rgba(44, 40, 37, 0.13);
            box-shadow: 0 4px 12px rgba(44, 40, 37, 0.05);
          }

          .project-showcase__panel .project-deck__slot[data-deck-depth='2'] .project-card,
          .project-showcase__panel .project-deck__slot[data-deck-depth='2'] .project-card:hover,
          .project-showcase__panel .project-deck__slot[data-deck-depth='hidden'] .project-card,
          .project-showcase__panel .project-deck__slot[data-deck-depth='hidden'] .project-card:hover {
            background: #ece5db;
            border-color: rgba(44, 40, 37, 0.11);
            box-shadow: 0 2px 6px rgba(44, 40, 37, 0.04);
          }

          .project-deck__controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.1rem;
            margin-top: 0.45rem;
          }

          .project-deck__nav {
            width: 36px;
            height: 36px;
            flex: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(44, 40, 37, 0.14);
            border-radius: 999px;
            background: #fcfaf7;
            color: var(--color-text);
            cursor: pointer;
            transition:
              background var(--duration-fast),
              border-color var(--duration-fast),
              transform var(--duration-fast);
          }

          .project-deck__nav:active {
            transform: scale(0.94);
            background: #f3ede5;
          }

          .project-deck__status {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.35rem;
            min-width: 146px;
          }

          .project-deck__meta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.45rem;
            min-height: 1.25rem;
          }

          .project-deck__counter {
            font-family: var(--font-mono);
            font-size: 0.74rem;
            font-weight: 500;
            color: var(--color-text-muted);
            letter-spacing: 0.04em;
          }

          .project-deck__boundary {
            font-family: var(--font-mono);
            font-size: 0.68rem;
            padding: 1px 7px;
            border-radius: 999px;
            background: rgba(44, 40, 37, 0.06);
            color: var(--color-text-subtle);
            white-space: nowrap;
          }

          .project-deck__boundary.is-wrap {
            background: rgba(156, 91, 56, 0.13);
            color: var(--color-primary-ink);
            font-weight: 600;
            animation: deckWrapBadge 320ms var(--ease-out-expo);
          }

          .project-deck__segments {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
          }

          .project-deck__segment {
            padding: 7px 3px;
            border: 0;
            background: transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
          }

          .project-deck__segment-bar {
            display: block;
            width: 10px;
            height: 4px;
            border-radius: 999px;
            background: rgba(44, 40, 37, 0.18);
            transition: width 260ms var(--ease-out-expo), background 200ms ease;
          }

          .project-deck__segment.is-active .project-deck__segment-bar {
            width: 24px;
            background: var(--color-primary-ink);
          }
        }

        @keyframes deckLeaveNext {
          0% {
            transform: translate3d(var(--leave-start-x, 0px), 0, 0) rotate(var(--leave-start-rot, 0deg)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate3d(-112%, -8px, 0) rotate(-4.5deg) scale(0.96);
            opacity: 0;
          }
        }

        @keyframes deckLeavePrev {
          0% {
            transform: translate3d(var(--leave-start-x, 0px), 0, 0) rotate(var(--leave-start-rot, 0deg)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate3d(112%, -8px, 0) rotate(4.5deg) scale(0.96);
            opacity: 0;
          }
        }

        @keyframes deckWrapNext {
          0% {
            z-index: 30;
            transform: translate3d(var(--leave-start-x, 0px), 0, 0) rotate(var(--leave-start-rot, 0deg)) scale(1);
            opacity: 1;
          }
          45% {
            z-index: 30;
            transform: translate3d(-74%, -6px, 0) rotate(-3.5deg) scale(0.96);
            opacity: 0.96;
          }
          46% {
            z-index: 1;
          }
          100% {
            z-index: 1;
            transform: translate3d(0, var(--settle-y, 18px), 0) rotate(0deg) scale(var(--settle-scale, 0.92));
            opacity: var(--settle-opacity, 0.96);
          }
        }

        @keyframes deckWrapPrev {
          0% {
            z-index: 30;
            transform: translate3d(var(--leave-start-x, 0px), 0, 0) rotate(var(--leave-start-rot, 0deg)) scale(1);
            opacity: 1;
          }
          45% {
            z-index: 30;
            transform: translate3d(74%, -6px, 0) rotate(3.5deg) scale(0.96);
            opacity: 0.96;
          }
          46% {
            z-index: 1;
          }
          100% {
            z-index: 1;
            transform: translate3d(0, var(--settle-y, 9px), 0) rotate(0deg) scale(var(--settle-scale, 0.96));
            opacity: var(--settle-opacity, 1);
          }
        }

        @keyframes deckWrapBadge {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .project-showcase {
            gap: var(--space-md);
          }

          .project-showcase__panel {
            padding: var(--space-md);
          }
        }

        @media (hover: none) {
          .project-showcase__panel .project-showcase__cards {
            opacity: 1;
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .project-deck__slot,
          .project-deck__drawer,
          .project-deck__segment-bar {
            transition: none;
          }

          .project-deck__slot--leave-next,
          .project-deck__slot--leave-prev,
          .project-deck__slot--wrap-next,
          .project-deck__slot--wrap-prev,
          .project-deck__boundary.is-wrap {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
