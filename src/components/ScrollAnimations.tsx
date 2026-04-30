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

    const ctx = gsap.context(() => {
      // Hero entrance animation - optimized timing
      const heroTl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        delay: 0.1
      });

      heroTl
        .from('.hero__badge', {
          y: 12,
          opacity: 0,
          duration: 0.5
        })
        .from('.hero__eyebrow', {
          y: 16,
          opacity: 0,
          duration: 0.5
        }, '-=0.3')
        .from('.hero__name-first', {
          y: 60,
          opacity: 0,
          duration: 0.8
        }, '-=0.35')
        .from('.hero__name-last', {
          y: 60,
          opacity: 0,
          duration: 0.8
        }, '-=0.65')
        .from(['.hero__title', '.hero__subtitle'], {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08
        }, '-=0.4')
        .from('.hero__stats', {
          y: 16,
          opacity: 0,
          duration: 0.5
        }, '-=0.3')
        .from('.hero__intro', {
          y: 16,
          opacity: 0,
          duration: 0.5
        }, '-=0.25')
        .from('.hero__links', {
          y: 12,
          opacity: 0,
          duration: 0.5
        }, '-=0.25')
        .from('.hero__signal', {
          scale: 0.9,
          opacity: 0,
          duration: 0.8
        }, '-=0.6')
        .from('.hero__scroll-indicator', {
          opacity: 0,
          duration: 0.5
        }, '-=0.3');

      // Section reveal animations with Intersection Observer pattern
      gsap.utils.toArray<HTMLElement>('[data-section]').forEach((section) => {
        if (section.classList.contains('hero')) return;

        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          },
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out'
        });
      });

      // Project showcase stagger animation
      ScrollTrigger.create({
        trigger: '.project-showcase',
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.project-showcase__panel', {
            y: 30,
            opacity: 0,
            stagger: 0.12,
            duration: 0.6,
            ease: 'power2.out'
          });
        },
        once: true
      });

      // Profile rows animation
      ScrollTrigger.create({
        trigger: '.profile__rows',
        start: 'top 85%',
        onEnter: () => {
          gsap.from('.profile__row', {
            y: 20,
            opacity: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power2.out'
          });
        },
        once: true
      });

      // Skills items stagger
      gsap.utils.toArray<HTMLElement>('.skills__category').forEach((category) => {
        ScrollTrigger.create({
          trigger: category,
          start: 'top 88%',
          onEnter: () => {
            gsap.from(category.querySelectorAll('.skills__item'), {
              y: 12,
              opacity: 0,
              stagger: 0.03,
              duration: 0.3,
              ease: 'power2.out'
            });
          },
          once: true
        });
      });

      // Experience items animation
      ScrollTrigger.create({
        trigger: '.experience__content',
        start: 'top 85%',
        onEnter: () => {
          gsap.from('.recognition-list__group, .experience__item', {
            y: 24,
            opacity: 0,
            stagger: 0.05,
            duration: 0.5,
            ease: 'power2.out'
          });
        },
        once: true
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
