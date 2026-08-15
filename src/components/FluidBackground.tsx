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

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  phase: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
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

    // Neural particles (constellation points)
    const particleCount = isMobile ? 18 : 38;
    const particleColors = ['#b8704a', '#7a9bb8', '#a08a75', '#5a5652'];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      particles.push({
        x: px,
        y: py,
        baseX: px,
        baseY: py,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.0,
        alpha: Math.random() * 0.25 + 0.12,
        color: particleColors[i % particleColors.length],
        phase: Math.random() * Math.PI * 2
      });
    }

    // Interactive ripples queue (max 4 active ripples)
    const ripples: Ripple[] = [];

    const addRipple = (x: number, y: number, color = 'rgba(184, 112, 74, 0.22)') => {
      if (ripples.length >= 4) {
        ripples.shift();
      }
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: isMobile ? 180 : 260,
        alpha: 0.32,
        speed: 3.5,
        color
      });
    };

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

        // Emit gentle fluid wave on fast sweeps
        const speedSq = m.vx * m.vx + m.vy * m.vy;
        if (speedSq > 900 && Math.random() < 0.15) {
          addRipple(currentX, currentY, 'rgba(122, 155, 184, 0.18)');
        }
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

    const handleClick = (e: MouseEvent) => {
      addRipple(e.clientX, e.clientY, 'rgba(212, 165, 116, 0.35)');
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

    // Draw ambient grid with multi-frequency intersections
    const drawGrid = (scrollOffset: number) => {
      const gridSize = 80;
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 170, 160, 0.05)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines with subtle scroll parallax
      const offsetY = (scrollOffset * 0.02) % gridSize;
      for (let y = -gridSize + offsetY; y <= height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Subtle crosshair accents at grid intersections
      if (!isMobile) {
        ctx.fillStyle = 'rgba(184, 112, 74, 0.12)';
        for (let x = gridSize * 2; x < width - gridSize; x += gridSize * 3) {
          for (let y = gridSize * 2 + offsetY; y < height; y += gridSize * 3) {
            ctx.fillRect(x - 2, y, 5, 1);
            ctx.fillRect(x, y - 2, 1, 5);
          }
        }
      }

      ctx.restore();
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

    // Update and draw neural particles + connections
    const updateAndDrawParticles = (motionScale: number, scrollOffset: number) => {
      const mouse = mouseRef.current;
      const scrollDrift = scrollOffset * 0.08;
      const maxConnectDistSq = 125 * 125; // Pre-calculated squared distance

      // Update positions
      particles.forEach((p) => {
        p.x += p.vx * motionScale;
        p.y += p.vy * motionScale;

        // Wrap around screen
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Mouse interaction: soft push away
        if (mouse.active && !isMobile) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const distSq = mdx * mdx + mdy * mdy;
          const repelDist = 120;

          if (distSq < repelDist * repelDist && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / repelDist) * 1.5;
            p.x += (mdx / dist) * force;
            p.y += (mdy / dist) * force;
          }
        }
      });

      // Draw connection lines on desktop (O(N^2/2) with squared distance)
      if (!isMobile) {
        ctx.lineWidth = 0.75;
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          const y1 = (p1.y + scrollDrift) % (height + 40);
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const y2 = (p2.y + scrollDrift) % (height + 40);
            const dx = p1.x - p2.x;
            const dy = y1 - y2;
            const dSq = dx * dx + dy * dy;

            if (dSq < maxConnectDistSq) {
              const alpha = (1 - dSq / maxConnectDistSq) * 0.18;
              ctx.strokeStyle = `rgba(184, 112, 74, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, y1);
              ctx.lineTo(p2.x, y2);
              ctx.stroke();
            }
          }
        }
      }

      // Draw particle dots
      particles.forEach((p) => {
        const drawY = (p.y + scrollDrift) % (height + 40);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha + Math.sin(time * 0.02 + p.phase) * 0.06;
        ctx.beginPath();
        ctx.arc(p.x, drawY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    // Draw and update expanding fluid ripples
    const updateAndDrawRipples = () => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += rip.speed;
        rip.alpha *= 0.96;

        if (rip.alpha < 0.01 || rip.radius >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = rip.color.replace(/[\d.]+\)$/, `${rip.alpha})`);
        ctx.lineWidth = Math.max(1, 2.5 * (1 - rip.radius / rip.maxRadius));
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
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

      // 2. Ambient Grid & Crosshairs
      drawGrid(scrollOffset);

      // 3. Neural Particles Field
      updateAndDrawParticles(motionScale, scrollOffset);

      // 4. Fluid Waves & Ripples
      updateAndDrawRipples();

      // 5. Filmic Grain Noise
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
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
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
