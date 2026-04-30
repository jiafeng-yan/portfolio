import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return;
    }
    
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    });
    
    lenisRef.current = lenis;
    
    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    // Use GSAP ticker for animation loop
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
  
  return null;
}
