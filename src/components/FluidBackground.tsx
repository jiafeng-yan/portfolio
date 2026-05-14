import { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  alpha: number;
  // Brownian motion parameters
  vx: number;
  vy: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  // Mouse interaction
  targetX: number;
  targetY: number;
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    // Smooth, constant-speed motion using sine waves
    // Each orb has its own phase and frequency for variety
    const getOrbMotion = (orbIndex: number, t: number): { dx: number; dy: number } => {
      // Different frequencies for each orb to create variety
      const freqX = [0.0008, 0.001, 0.0007, 0.0009, 0.0006][orbIndex];
      const freqY = [0.0009, 0.0007, 0.001, 0.0006, 0.0008][orbIndex];

      // Different phases for each orb
      const phaseX = [0, Math.PI / 3, Math.PI / 2, Math.PI / 4, Math.PI][orbIndex];
      const phaseY = [Math.PI / 6, 0, Math.PI / 4, Math.PI / 3, Math.PI / 2][orbIndex];

      // Smooth sine wave motion - constant speed, no sudden changes
      const dx = Math.sin(t * freqX + phaseX) * 0.8 + Math.sin(t * freqX * 0.5 + phaseX * 2) * 0.4;
      const dy = Math.cos(t * freqY + phaseY) * 0.8 + Math.cos(t * freqY * 0.5 + phaseY * 2) * 0.4;

      return { dx, dy };
    };

    // Noise texture data
    const noiseSize = 256;
    const noiseData = new Uint8ClampedArray(noiseSize * noiseSize * 4);

    // Generate noise
    for (let i = 0; i < noiseSize * noiseSize; i++) {
      const value = Math.random() * 255;
      noiseData[i * 4] = value;
      noiseData[i * 4 + 1] = value;
      noiseData[i * 4 + 2] = value;
      noiseData[i * 4 + 3] = 12; // Very subtle opacity
    }

    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext('2d');
    if (noiseCtx) {
      const imageData = new ImageData(noiseData, noiseSize, noiseSize);
      noiseCtx.putImageData(imageData, 0, 0);
    }

    // Floating orbs with Brownian motion - warm, humanistic colors
    const orbs: Orb[] = [
      {
        x: width * 0.2, y: height * 0.3,
        baseX: width * 0.2, baseY: height * 0.3,
        radius: 320, color: '#d4a574', alpha: 0.28,
        vx: 0, vy: 0, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000,
        targetX: width * 0.2, targetY: height * 0.3
      },
      {
        x: width * 0.75, y: height * 0.25,
        baseX: width * 0.75, baseY: height * 0.25,
        radius: 380, color: '#7a9bb8', alpha: 0.22,
        vx: 0, vy: 0, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000,
        targetX: width * 0.75, targetY: height * 0.25
      },
      {
        x: width * 0.6, y: height * 0.7,
        baseX: width * 0.6, baseY: height * 0.7,
        radius: 350, color: '#c98b7a', alpha: 0.25,
        vx: 0, vy: 0, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000,
        targetX: width * 0.6, targetY: height * 0.7
      },
      {
        x: width * 0.25, y: height * 0.75,
        baseX: width * 0.25, baseY: height * 0.75,
        radius: 300, color: '#9a8b6a', alpha: 0.20,
        vx: 0, vy: 0, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000,
        targetX: width * 0.25, targetY: height * 0.75
      },
      {
        x: width * 0.5, y: height * 0.45,
        baseX: width * 0.5, baseY: height * 0.45,
        radius: 420, color: '#b8a090', alpha: 0.18,
        vx: 0, vy: 0, noiseOffsetX: Math.random() * 1000, noiseOffsetY: Math.random() * 1000,
        targetX: width * 0.5, targetY: height * 0.45
      },
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Update base positions on resize
      orbs[0].baseX = width * 0.2; orbs[0].baseY = height * 0.3;
      orbs[1].baseX = width * 0.75; orbs[1].baseY = height * 0.25;
      orbs[2].baseX = width * 0.6; orbs[2].baseY = height * 0.7;
      orbs[3].baseX = width * 0.25; orbs[3].baseY = height * 0.75;
      orbs[4].baseX = width * 0.5; orbs[4].baseY = height * 0.45;
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const drawGrid = () => {
      const gridSize = 80;
      const scrollOffset = window.scrollY * 0.02;
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 170, 160, 0.06)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines with subtle scroll offset
      const offsetY = scrollOffset % gridSize;
      for (let y = -gridSize + offsetY; y <= height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const updateOrbs = (orbIndex: number) => {
      return () => {
        const orb = orbs[orbIndex];
        if (!orb) return;

        const mouseInfluence = 120; // Reduced from 180
        const mouseStrength = 0.08; // Reduced from 0.2
        const motionStrength = 100; // Smooth motion strength
        const returnStrength = 0.015; // Increased to keep orbs closer to base
        const damping = 0.96;

        // Get smooth, constant-speed motion
        const motion = getOrbMotion(orbIndex, time);

        // Apply smooth motion force
        orb.vx += motion.dx * motionStrength * 0.01;
        orb.vy += motion.dy * motionStrength * 0.01;

        // Mouse interaction - gentle repulsion
        if (mouseRef.current.active) {
          const dx = orb.x - mouseRef.current.x;
          const dy = orb.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseInfluence && dist > 0) {
            const force = (1 - dist / mouseInfluence) * mouseStrength;
            orb.vx += (dx / dist) * force * 30; // Reduced from 50
            orb.vy += (dy / dist) * force * 30;
          }
        }

        // Soft repulsion between orbs
        orbs.forEach((other, otherIndex) => {
          if (otherIndex === orbIndex) return;
          const dx = orb.x - other.x;
          const dy = orb.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (orb.radius + other.radius) * 0.3;

          if (dist < minDist && dist > 0) {
            const force = (1 - dist / minDist) * 0.02;
            orb.vx += (dx / dist) * force * 10;
            orb.vy += (dy / dist) * force * 10;
          }
        });

        // Return force to base position
        const returnDx = orb.baseX - orb.x;
        const returnDy = orb.baseY - orb.y;
        orb.vx += returnDx * returnStrength;
        orb.vy += returnDy * returnStrength;

        // Apply velocity with damping
        orb.vx *= damping;
        orb.vy *= damping;

        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Clamp to reasonable bounds
        const maxDrift = 150; // Reduced from 200
        orb.x = Math.max(orb.baseX - maxDrift, Math.min(orb.baseX + maxDrift, orb.x));
        orb.y = Math.max(orb.baseY - maxDrift, Math.min(orb.baseY + maxDrift, orb.y));
      };
    };

    const drawOrbs = () => {
      orbs.forEach((orb) => {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);

        // Parse the hex color to RGB for gradient stops
        const r = parseInt(orb.color.slice(1, 3), 16);
        const g = parseInt(orb.color.slice(3, 5), 16);
        const b = parseInt(orb.color.slice(5, 7), 16);

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${orb.alpha})`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.7})`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${orb.alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawNoise = () => {
      ctx.globalAlpha = 0.3;
      ctx.drawImage(noiseCanvas, 0, 0, width, height);
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      time++;

      // Clear with warm cream background
      ctx.fillStyle = '#f8f6f3';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(248, 246, 243, 1)');
      gradient.addColorStop(0.5, 'rgba(252, 250, 247, 0.5)');
      gradient.addColorStop(1, 'rgba(245, 243, 240, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw floating orbs
      orbs.forEach((_, index) => updateOrbs(index)());
      drawOrbs();

      // Draw grid
      drawGrid();

      // Draw noise texture
      drawNoise();

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
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
