import { useRef, useState } from 'react';
import gsap from 'gsap';

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

interface Props {
  project: Project;
}

const LinkIcons = {
  github: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.835 1.305 3.51.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  arxiv: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm3 3h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
    </svg>
  ),
  paper: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
    </svg>
  ),
  demo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
};

const LinkLabels = {
  github: 'GitHub',
  arxiv: 'arXiv',
  paper: 'Paper',
  demo: 'Demo'
};

export function ProjectCard({ project }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const animate = (expanded: boolean) => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      y: expanded ? -8 : 0,
      boxShadow: expanded ? '0 20px 60px rgba(44, 40, 37, 0.12)' : '0 0 0 rgba(44, 40, 37, 0)',
      borderColor: expanded ? 'rgba(184, 112, 74, 0.25)' : 'rgba(44, 40, 37, 0.10)',
      duration: 0.4,
      ease: 'power2.out'
    });

    // Animate tech tags with stagger
    const techItems = card.querySelectorAll('.project-card__tech-item');
    gsap.to(techItems, {
      y: expanded ? -2 : 0,
      scale: expanded ? 1.02 : 1,
      duration: 0.3,
      stagger: 0.02,
      ease: 'power2.out'
    });

    // Animate links
    const links = card.querySelectorAll('.project-card__link');
    gsap.to(links, {
      x: expanded ? 4 : 0,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power2.out'
    });
  };

  const expand = () => {
    setIsExpanded(true);
    animate(true);
  };

  const collapse = () => {
    setIsExpanded(false);
    animate(false);
  };

  return (
    <article
      ref={cardRef}
      className="project-card"
      data-cursor-hover
      tabIndex={0}
      aria-expanded={isExpanded}
      onMouseEnter={expand}
      onMouseLeave={collapse}
      onFocus={expand}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          collapse();
        }
      }}
    >
      <div className="project-card__header">
        <div className="project-card__meta">
          <span className="project-card__venue">{project.venue}</span>
          {project.status && (
            <span className="project-card__status">{project.status}</span>
          )}
        </div>
        <h4 className="project-card__title">{project.title}</h4>
        <p className="project-card__subtitle">{project.subtitle}</p>
      </div>

      <div
        className="project-card__content"
        data-expanded={isExpanded}
      >
        <p className="project-card__description">{project.description}</p>

        {project.highlights && project.highlights.length > 0 && (
          <ul className="project-card__highlights">
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}

        <div className="project-card__footer">
          <ul className="project-card__tech">
            {project.technologies.map((tech) => (
              <li key={tech} className="project-card__tech-item">{tech}</li>
            ))}
          </ul>

          {project.links && project.links.length > 0 && (
            <div className="project-card__links">
              {project.links.map((link) => (
                <a
                  key={`${link.type}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-card__link"
                  data-cursor-hover
                >
                  {LinkIcons[link.type]}
                  <span className="project-card__link-label">{LinkLabels[link.type]}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .project-card {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-lg);
          padding: var(--space-md);
          transition:
            background var(--duration-normal) var(--ease-out-expo),
            border-color var(--duration-normal) var(--ease-out-expo);
          will-change: transform;
          outline: none;
          backdrop-filter: blur(8px);
        }

        .project-card:hover,
        .project-card:focus-within,
        .project-card:focus {
          background: rgba(255, 255, 255, 0.98);
          border-color: var(--color-border-strong);
        }

        .project-card:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 3px;
        }

        .project-card__meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .project-card__venue {
          font-size: 0.72rem;
          text-transform: uppercase;
          color: var(--color-beige);
          font-family: var(--font-mono);
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .project-card__status {
          font-size: 0.68rem;
          padding: 3px 10px;
          background: rgba(122, 155, 184, 0.15);
          color: var(--color-ink-blue);
          border-radius: 999px;
          font-weight: 600;
        }

        .project-card__title {
          font-size: clamp(1rem, 1.5vw, 1.2rem);
          font-weight: 600;
          line-height: 1.45;
          margin-bottom: var(--space-xs);
          color: var(--color-text);
        }

        .project-card__subtitle {
          font-size: 0.86rem;
          color: var(--color-text-muted);
          line-height: 1.6;
        }

        .project-card__content {
          opacity: 1;
          max-height: 720px;
          margin-top: var(--space-md);
        }

        .project-card__description {
          color: var(--color-text-muted);
          line-height: 1.75;
          font-size: 0.92rem;
          margin-bottom: var(--space-md);
        }

        .project-card__highlights {
          display: grid;
          gap: var(--space-xs);
          margin: 0 0 var(--space-md);
          padding-left: 1rem;
          color: var(--color-text-muted);
          font-size: 0.86rem;
          line-height: 1.6;
        }

        .project-card__highlights li::marker {
          color: var(--color-primary);
        }

        .project-card__footer {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .project-card__tech {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .project-card__tech-item {
          font-size: 0.72rem;
          padding: 5px 10px;
          background: rgba(44, 40, 37, 0.05);
          border-radius: 6px;
          font-family: var(--font-mono);
          color: var(--color-text-muted);
          font-weight: 500;
          transition: background var(--duration-fast), transform var(--duration-fast);
        }

        .project-card:hover .project-card__tech-item {
          background: rgba(44, 40, 37, 0.08);
        }

        .project-card__links {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .project-card__link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 6px 12px;
          background: rgba(44, 40, 37, 0.05);
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 500;
          transition:
            background var(--duration-fast),
            color var(--duration-fast),
            transform var(--duration-fast);
        }

        .project-card__link:hover,
        .project-card__link:focus-visible {
          background: var(--color-primary);
          color: white;
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .project-card {
            padding: var(--space-md);
          }

          .project-card__title {
            font-size: 1rem;
          }

          .project-card__subtitle,
          .project-card__description,
          .project-card__highlights {
            font-size: 0.84rem;
          }
        }

        @media (hover: none) {
          .project-card__content {
            max-height: 720px !important;
            opacity: 1 !important;
            margin-top: var(--space-md);
          }

          .project-card:hover {
            background: rgba(255, 255, 255, 0.85);
          }
        }
      `}</style>
    </article>
  );
}
