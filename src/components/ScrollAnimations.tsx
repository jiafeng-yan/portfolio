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

      // Parallax effect on hero elements
      gsap.to('.hero__name-first', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: -80,
        ease: 'none'
      });

      gsap.to('.hero__name-last', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        },
        y: -100,
        ease: 'none'
      });

      gsap.to('.hero__subtitle', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8
        },
        y: -40,
        opacity: 0.5,
        ease: 'none'
      });

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

      // Projects header special animation
      ScrollTrigger.create({
        trigger: '.projects__header',
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.projects__header h2', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
          gsap.from('.projects__header p', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            delay: 0.1,
            ease: 'power2.out'
          });
        },
        once: true
      });

      // Project showcase stagger animation with parallax
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

      // Profile rows animation with slide-in effect
      ScrollTrigger.create({
        trigger: '.profile__rows',
        start: 'top 85%',
        onEnter: () => {
          gsap.from('.profile__row', {
            x: -20,
            y: 20,
            opacity: 0,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power2.out'
          });
        },
        once: true
      });

      // Skills items stagger with scale effect
      gsap.utils.toArray<HTMLElement>('.skills__category').forEach((category) => {
        ScrollTrigger.create({
          trigger: category,
          start: 'top 88%',
          onEnter: () => {
            gsap.from(category.querySelectorAll('.skills__item'), {
              y: 12,
              scale: 0.95,
              opacity: 0,
              stagger: 0.03,
              duration: 0.3,
              ease: 'power2.out'
            });
          },
          once: true
        });
      });

      // Experience items animation with timeline effect
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

      // Footer fade-in
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
    });

    return () => ctx.revert();
  }, []);

  return null;
}
