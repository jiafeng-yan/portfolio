import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
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
  links?: ProjectLink[];
  status?: string;
}

interface Props {
  title: string;
  projects: Project[];
  position: 'left' | 'right';
  isFaded?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export function ProjectCategory({ title, projects, position, isFaded, onHover, onLeave }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleMouseEnter = () => {
      setIsExpanded(true);
      onHover?.();
      gsap.to(container, {
        width: '70%',
        duration: 0.5,
        ease: 'power2.out'
      });
    };
    
    const handleMouseLeave = () => {
      setIsExpanded(false);
      onLeave?.();
      gsap.to(container, {
        width: '45%',
        duration: 0.5,
        ease: 'power2.out'
      });
    };
    
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onHover, onLeave]);
  
  return (
    <>
      <div
        ref={containerRef}
        className={`project-category project-category--${position}`}
        data-expanded={isExpanded}
        data-faded={isFaded}
      >
        <div className="project-category__header">
          <h2 className="project-category__title">{title}</h2>
          <span className="project-category__count">{projects.length}</span>
        </div>
        
        <div className="project-category__content">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
      
      <style>{`
        .project-category {
          border: 2px solid var(--color-gray);
          border-radius: 16px;
          padding: var(--space-lg);
          width: 45%;
          min-height: 200px;
          transition: opacity 0.4s var(--ease-out-expo), transform 0.4s var(--ease-out-expo);
          overflow: hidden;
          background: rgba(255, 255, 255, 0.6);
        }

        .project-category--left {
          margin-right: auto;
        }

        .project-category--right {
          margin-left: auto;
        }

        .project-category[data-faded=true] {
          opacity: 0.2;
          transform: translateX(30px);
        }

        .project-category__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        .project-category__title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .project-category__count {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          background: rgba(0, 0, 0, 0.04);
          padding: var(--space-xs) var(--space-sm);
          border-radius: 4px;
        }

        .project-category__content {
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: opacity 0.5s var(--ease-out-expo), max-height 0.5s var(--ease-out-expo);
        }

        .project-category[data-expanded=true] .project-category__content {
          opacity: 1;
          max-height: 2000px;
        }

        /* Mobile: Full width, stack vertically */
        @media (max-width: 768px) {
          .project-category {
            width: 100%;
            margin: 0 0 var(--space-md) 0;
          }
          
          .project-category[data-faded=true] {
            opacity: 1;
            transform: none;
          }
        }

        /* Touch devices: Tap to expand */
        @media (hover: none) {
          .project-category__content {
            max-height: 2000px;
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
