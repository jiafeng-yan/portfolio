import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // 1. Hero entrance timeline
      const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.1
      });

      heroTl
        .from('.hero__badge', {
          y: 16,
          scale: 0.94,
          opacity: 0,
          duration: 0.6
        })
        .from('.hero__eyebrow', {
          y: 16,
          opacity: 0,
          duration: 0.5
        }, '-=0.35')
        .from('.hero__name-first', {
          y: isMobile ? 30 : 60,
          opacity: 0,
          duration: 0.85,
          ease: 'power4.out'
        }, '-=0.35')
        .from('.hero__name-last', {
          y: isMobile ? 30 : 60,
          opacity: 0,
          duration: 0.85,
          ease: 'power4.out'
        }, '-=0.68')
        .from(['.hero__title', '.hero__subtitle'], {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08
        }, '-=0.45')
        .from('.hero__stats', {
          y: 20,
          scale: 0.96,
          opacity: 0,
          duration: 0.6
        }, '-=0.35')
        .from('.hero__intro', {
          y: 16,
          opacity: 0,
          duration: 0.55
        }, '-=0.3')
        .from('.hero__links', {
          y: 14,
          opacity: 0,
          duration: 0.5
        }, '-=0.25')
        .from('.hero__signal', {
          scale: 0.85,
          opacity: 0,
          duration: 1.0,
          ease: 'power2.out'
        }, '-=0.75')
        .from('.hero__scroll-indicator', {
          opacity: 0,
          y: -10,
          duration: 0.6
        }, '-=0.4');

      // 2. Parallax effect on hero elements
      if (!isMobile) {
        gsap.to('.hero__name-first', {
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: -60,
          ease: 'none'
        });

        gsap.to('.hero__name-last', {
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
          },
          y: -80,
          ease: 'none'
        });

        gsap.to('.hero__subtitle', {
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8
          },
          y: -35,
          opacity: 0.4,
          ease: 'none'
        });

        gsap.to('.hero__signal', {
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          },
          y: 80,
          rotation: 30,
          ease: 'none'
        });
      }

      // 3. Line draws & section header reveals
      gsap.utils.toArray<HTMLElement>('.profile__rows, .recognition-list, .experience__timeline, .skills__category').forEach((lineEl) => {
        ScrollTrigger.create({
          trigger: lineEl,
          start: 'top 88%',
          onEnter: () => {
            gsap.from(lineEl, {
              borderTopColor: 'rgba(0, 0, 0, 0)',
              duration: 0.8,
              ease: 'power2.out'
            });
          },
          once: true
        });
      });

      // 4. Section reveal animations
      gsap.utils.toArray<HTMLElement>('[data-section]').forEach((section) => {
        if (section.classList.contains('hero')) return;

        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          },
          y: isMobile ? 20 : 35,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out'
        });
      });

      // 5. Projects header special animation
      ScrollTrigger.create({
        trigger: '.projects__header',
        start: 'top 82%',
        onEnter: () => {
          gsap.from('.projects__header .section-kicker', {
            x: -15,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
          gsap.from('.projects__header h2', {
            y: 25,
            opacity: 0,
            duration: 0.6,
            delay: 0.05,
            ease: 'power3.out'
          });
          gsap.from('.projects__header p', {
            y: 18,
            opacity: 0,
            duration: 0.5,
            delay: 0.12,
            ease: 'power3.out'
          });
        },
        once: true
      });

      // 6. Project showcase stagger animation
      ScrollTrigger.create({
        trigger: '.project-showcase',
        start: 'top 82%',
        onEnter: () => {
          gsap.from('.project-showcase__panel', {
            y: 30,
            scale: 0.98,
            opacity: 0,
            stagger: 0.12,
            duration: 0.65,
            ease: 'power3.out'
          });
        },
        once: true
      });

      // 7. Profile rows animation with slide-in effect
      ScrollTrigger.create({
        trigger: '.profile__rows',
        start: 'top 85%',
        onEnter: () => {
          gsap.from('.profile__row', {
            x: isMobile ? 0 : -20,
            y: 16,
            opacity: 0,
            stagger: 0.06,
            duration: 0.55,
            ease: 'power3.out'
          });
        },
        once: true
      });

      // 8. Skills items stagger with scale effect
      gsap.utils.toArray<HTMLElement>('.skills__category').forEach((category) => {
        ScrollTrigger.create({
          trigger: category,
          start: 'top 88%',
          onEnter: () => {
            gsap.from(category.querySelectorAll('.skills__item'), {
              y: 10,
              scale: 0.94,
              opacity: 0,
              stagger: 0.03,
              duration: 0.35,
              ease: 'power2.out'
            });
          },
          once: true
        });
      });

      // 9. Experience items animation with timeline effect
      ScrollTrigger.create({
        trigger: '.experience__content',
        start: 'top 85%',
        onEnter: () => {
          gsap.from('.recognition-list__group, .experience__item', {
            y: 20,
            opacity: 0,
            stagger: 0.05,
            duration: 0.5,
            ease: 'power3.out'
          });
        },
        once: true
      });

      // 10. Footer fade-in
      ScrollTrigger.create({
        trigger: '.footer',
        start: 'top 90%',
        onEnter: () => {
          gsap.from('.footer', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
        },
        once: true
      });

      // Refresh triggers after full layout calculations
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    });

    return () => ctx.revert();
  }, []);

  return null;
}
