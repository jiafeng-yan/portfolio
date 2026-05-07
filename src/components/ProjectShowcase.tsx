import { useEffect, useRef } from 'react';
import { ProjectCard } from './ProjectCard';

interface ProjectLink {
  type: 'github' | 'arxiv' | 'paper' | 'demo';
  url: string;
}

interface Project {
  id: string;
  title: string;
  subtitle: string;
  venue: string;
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

export function ProjectShowcase({ groups }: Props) {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase) return;

    // Check if :has() is supported
    const supportsHas = CSS.supports('selector(:has(*))');

    // If :has() is not supported, use JavaScript fallback
    if (!supportsHas) {
      const panels = showcase.querySelectorAll<HTMLDivElement>('.project-showcase__panel');
      panelsRef.current = Array.from(panels);

      // Store handlers for proper cleanup
      const handlers: Map<HTMLDivElement, { enter: () => void; leave: () => void }> = new Map();

      const handlePanelHover = (panel: HTMLDivElement, isHovering: boolean) => {
        const otherPanel = panelsRef.current.find(p => p !== panel);

        if (isHovering) {
          // Expand hovered panel
          panel.style.flexBasis = 'calc((100% - var(--showcase-gap)) * 0.62)';
          panel.style.background = 'rgba(255, 255, 255, 0.86)';
          panel.style.borderColor = 'rgba(26, 26, 26, 0.32)';
          panel.style.transform = 'translateY(-4px)';
          panel.style.opacity = '1';

          // Shrink other panel
          if (otherPanel) {
            otherPanel.style.flexBasis = 'calc((100% - var(--showcase-gap)) * 0.38)';
            otherPanel.style.opacity = '0.58';
            otherPanel.style.transform = 'translateY(8px)';
          }
        } else {
          // Reset both panels
          panelsRef.current.forEach(p => {
            p.style.flexBasis = 'calc((100% - var(--showcase-gap)) / 2)';
            p.style.background = 'rgba(255, 255, 255, 0.58)';
            p.style.borderColor = 'rgba(0, 0, 0, 0.12)';
            p.style.transform = 'translateY(0)';
            p.style.opacity = '1';
          });
        }
      };

      panelsRef.current.forEach(panel => {
        const enterHandler = () => handlePanelHover(panel, true);
        const leaveHandler = () => handlePanelHover(panel, false);
        handlers.set(panel, { enter: enterHandler, leave: leaveHandler });

        panel.addEventListener('mouseenter', enterHandler);
        panel.addEventListener('mouseleave', leaveHandler);
        panel.addEventListener('focusin', enterHandler);
        panel.addEventListener('focusout', leaveHandler);
      });

      return () => {
        panelsRef.current.forEach(panel => {
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

      const target = event.target instanceof Element ? event.target : null;
      const panel = target?.closest<HTMLElement>('.project-showcase__panel');
      if (!panel || !showcase.contains(panel)) return;

      const cards = panel.querySelector<HTMLDivElement>('.project-showcase__cards');
      if (!cards) return;

      const maxScroll = cards.scrollHeight - cards.clientHeight;
      if (maxScroll <= 1) return;

      const deltaY = getPixelDelta(event, cards);
      if (deltaY === 0) return;

      const atTop = cards.scrollTop <= 0;
      const atBottom = cards.scrollTop >= maxScroll - 1;
      const scrollingUp = deltaY < 0;
      const scrollingDown = deltaY > 0;

      if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
        return;
      }

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
    <div
      ref={showcaseRef}
      className="project-showcase"
    >
      {groups.map((group) => {
        return (
          <section
            key={group.id}
            className="project-showcase__panel"
            aria-labelledby={`${group.id}-title`}
          >
            <header className="project-showcase__header">
              <div>
                <span className="project-showcase__eyebrow">{group.eyebrow}</span>
                <h3 id={`${group.id}-title`}>{group.title}</h3>
              </div>
              <span className="project-showcase__count">{group.projects.length}</span>
            </header>

            <p className="project-showcase__summary">{group.summary}</p>

            <ol className="project-showcase__preview" aria-label={`${group.title}列表`}>
              {group.projects.map((project) => (
                <li key={project.id}>{project.title}</li>
              ))}
            </ol>

            <div className="project-showcase__cards">
              {group.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        );
      })}

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
          background: rgba(255, 255, 255, 0.58);
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
            opacity: 0.58;
            transform: translateY(8px);
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
          color: var(--color-beige);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          text-transform: uppercase;
        }

        .project-showcase__header h3 {
          font-size: clamp(1.35rem, 2.3vw, 2rem);
        }

        .project-showcase__count {
          min-width: 2.2rem;
          height: 2.2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 999px;
          font-family: var(--font-mono);
          color: var(--color-text-muted);
        }

        .project-showcase__summary {
          color: var(--color-text-muted);
          font-size: 0.96rem;
          line-height: 1.8;
          margin-bottom: var(--space-md);
          max-width: 64rem;
          text-wrap: pretty;
        }

        .project-showcase__preview {
          list-style: decimal-leading-zero;
          list-style-position: inside;
          color: var(--color-gray);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          line-height: 1.8;
          margin-bottom: var(--space-md);
          flex: 0 0 auto;
          transition: opacity 0.35s var(--ease-out-expo), transform 0.35s var(--ease-out-expo);
        }

        .project-showcase__preview li {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-showcase__cards {
          display: grid;
          gap: var(--space-md);
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior-y: auto;
          padding-right: var(--space-sm);
          scrollbar-width: thin;
          scrollbar-color: rgba(160, 160, 160, 0.42) transparent;
          transition: opacity 0.35s var(--ease-out-expo), transform 0.45s var(--ease-out-expo);
        }

        @supports not selector(:has(*)) {
          /* Fallback for older browsers - JS handles the animation */
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
            opacity: 0.62;
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
          }

          .project-showcase__cards {
            overflow: visible;
            padding-right: 0;
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
      `}</style>
    </div>
  );
}