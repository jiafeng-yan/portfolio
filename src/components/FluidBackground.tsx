import { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  freqX: number;
  freqY: number;
  phaseX: number;
  phaseY: number;
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    active: false
  });
  const scrollRef = useRef({
    current: 0,
    target: 0,
    velocity: 0,
    lastY: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let isRunning = true;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    // Check device capability
    const isMobile = window.innerWidth < 768 || window.matchMedia('(hover: none)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-generate noise texture (offscreen 256x256 tile)
    const noiseSize = 256;
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext('2d');
    if (noiseCtx) {
      const noiseData = noiseCtx.createImageData(noiseSize, noiseSize);
      const data = noiseData.data;
      for (let i = 0; i < noiseSize * noiseSize; i++) {
        const val = (Math.random() * 255) | 0;
        const idx = i * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 10; // Extremely subtle fine film grain
      }
      noiseCtx.putImageData(noiseData, 0, 0);
    }

    // 5 warm humanistic fluid orbs with individual breathing harmonics
    const orbs: Orb[] = [
      {
        x: width * 0.22,
        y: height * 0.28,
        baseX: width * 0.22,
        baseY: height * 0.28,
        radius: 340,
        baseRadius: 340,
        color: '#d4a574', // Warm Amber
        alpha: 0.28,
        vx: 0,
        vy: 0,
        freqX: 0.0007,
        freqY: 0.0009,
        phaseX: 0,
        phaseY: Math.PI / 4
      },
      {
        x: width * 0.78,
        y: height * 0.24,
        baseX: width * 0.78,
        baseY: height * 0.24,
        radius: 390,
        baseRadius: 390,
        color: '#7a9bb8', // Slate Ink Blue
        alpha: 0.22,
        vx: 0,
        vy: 0,
        freqX: 0.0009,
        freqY: 0.0006,
        phaseX: Math.PI / 3,
        phaseY: 0
      },
      {
        x: width * 0.65,
        y: height * 0.72,
        baseX: width * 0.65,
        baseY: height * 0.72,
        radius: 360,
        baseRadius: 360,
        color: '#c98b7a', // Terracotta Rose
        alpha: 0.25,
        vx: 0,
        vy: 0,
        freqX: 0.0006,
        freqY: 0.0008,
        phaseX: Math.PI / 2,
        phaseY: Math.PI / 3
      },
      {
        x: width * 0.28,
        y: height * 0.78,
        baseX: width * 0.28,
        baseY: height * 0.78,
        radius: 320,
        baseRadius: 320,
        color: '#8e9b88', // Sage Olive Stone
        alpha: 0.20,
        vx: 0,
        vy: 0,
        freqX: 0.0008,
        freqY: 0.0007,
        phaseX: Math.PI / 4,
        phaseY: Math.PI / 2
      },
      {
        x: width * 0.50,
        y: height * 0.48,
        baseX: width * 0.50,
        baseY: height * 0.48,
        radius: 430,
        baseRadius: 430,
        color: '#b8a090', // Cashmere Beige
        alpha: 0.18,
        vx: 0,
        vy: 0,
        freqX: 0.0005,
        freqY: 0.0008,
        phaseX: Math.PI,
        phaseY: Math.PI / 6
      }
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-center orb base targets
      orbs[0].baseX = width * 0.22; orbs[0].baseY = height * 0.28;
      orbs[1].baseX = width * 0.78; orbs[1].baseY = height * 0.24;
      orbs[2].baseX = width * 0.65; orbs[2].baseY = height * 0.72;
      orbs[3].baseX = width * 0.28; orbs[3].baseY = height * 0.78;
      orbs[4].baseX = width * 0.50; orbs[4].baseY = height * 0.48;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;
      const m = mouseRef.current;

      if (m.prevX !== -1000) {
        m.vx = currentX - m.prevX;
        m.vy = currentY - m.prevY;
      }

      m.prevX = currentX;
      m.prevY = currentY;
      m.x = currentX;
      m.y = currentY;
      m.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.prevX = -1000;
      mouseRef.current.prevY = -1000;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - scrollRef.current.lastY;
      scrollRef.current.velocity = delta * 0.3;
      scrollRef.current.target = currentY;
      scrollRef.current.lastY = currentY;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        if (animationId) cancelAnimationFrame(animationId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animationId = requestAnimationFrame(animate);
        }
      }
    };

    // Update and draw organic fluid orbs
    const updateAndDrawOrbs = (motionScale: number, scrollOffset: number) => {
      const mouse = mouseRef.current;
      const scrollDrift = scrollOffset * 0.04;

      orbs.forEach((orb) => {
        // Multi-frequency harmonic motion
        const t = time;
        const dx = Math.sin(t * orb.freqX + orb.phaseX) * 0.9 + Math.sin(t * orb.freqX * 0.4 + orb.phaseX * 1.5) * 0.45;
        const dy = Math.cos(t * orb.freqY + orb.phaseY) * 0.9 + Math.cos(t * orb.freqY * 0.4 + orb.phaseY * 1.5) * 0.45;

        // Breathing radius fluctuation
        orb.radius = orb.baseRadius + Math.sin(t * 0.0012 + orb.phaseX) * 20;

        // Harmonic velocity
        orb.vx += dx * motionScale * 0.8;
        orb.vy += dy * motionScale * 0.8;

        // Mouse gentle repulsion
        if (mouse.active && !isMobile) {
          const mdx = orb.x - mouse.x;
          const mdy = (orb.y - scrollDrift) - mouse.y;
          const distSq = mdx * mdx + mdy * mdy;
          const maxDist = 280;

          if (distSq < maxDist * maxDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 0.06;
            orb.vx += (mdx / dist) * force * 15;
            orb.vy += (mdy / dist) * force * 15;
          }
        }

        // Return force to base position
        const returnDx = orb.baseX - orb.x;
        const returnDy = orb.baseY - orb.y;
        orb.vx += returnDx * 0.012;
        orb.vy += returnDy * 0.012;

        // Damping
        orb.vx *= 0.95;
        orb.vy *= 0.95;

        orb.x += orb.vx;
        orb.y += orb.vy;

        // Draw radial gradient orb
        const drawY = (orb.y + scrollDrift) % (height + orb.radius * 2) - orb.radius;
        const actualY = drawY < -orb.radius ? drawY + height + orb.radius * 2 : drawY;

        const gradient = ctx.createRadialGradient(orb.x, actualY, 0, orb.x, actualY, orb.radius);
        const r = parseInt(orb.color.slice(1, 3), 16);
        const g = parseInt(orb.color.slice(3, 5), 16);
        const b = parseInt(orb.color.slice(5, 7), 16);

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${orb.alpha})`);
        gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.65})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.25})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, actualY, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Main animation render loop
    const animate = () => {
      if (!isRunning) return;
      time++;

      const motionScale = prefersReducedMotion ? 0.15 : 1.0;

      // Smooth scroll interpolation
      scrollRef.current.current += (scrollRef.current.target - scrollRef.current.current) * 0.08;
      const scrollOffset = scrollRef.current.current;

      // Base canvas background fill
      ctx.fillStyle = '#f8f6f3';
      ctx.fillRect(0, 0, width, height);

      // Subtle base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#f8f6f3');
      bgGrad.addColorStop(0.5, '#fbf9f6');
      bgGrad.addColorStop(1, '#f4f1ec');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Organic Fluid Orbs
      updateAndDrawOrbs(motionScale, scrollOffset);

      // 2. Filmic Grain Noise
      ctx.globalAlpha = 0.28;
      ctx.drawImage(noiseCanvas, 0, 0, width, height);
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  );
}
