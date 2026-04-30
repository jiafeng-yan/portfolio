import { useEffect, useRef } from 'react';

interface SoftParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface ContourField {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  phase: number;
  speed: number;
  parallaxFactor: number;
}

interface FlowLine {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  alpha: number;
  phase: number;
  speed: number;
  parallaxFactor: number;
}

interface FeaturePoint {
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  phase: number;
  parallaxFactor: number;
}

const colors = ['#a0a0a0', '#d2b48c', '#b0c4de'];

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const scrollYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionScale = prefersReducedMotion ? 0.16 : 1;
    let particles: SoftParticle[] = [];
    let contourFields: ContourField[] = [];
    let flowLines: FlowLine[] = [];
    let featurePoints: FeaturePoint[] = [];
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    const alphaHex = (alpha: number) => Math.floor(alpha * 255).toString(16).padStart(2, '0');
    const wrapY = (y: number, margin = 260) => {
      const range = viewportHeight + margin * 2;
      return ((((y + margin) % range) + range) % range) - margin;
    };

    const seedScene = () => {
      particles = Array.from({ length: 16 }, () => ({
        x: Math.random() * viewportWidth,
        y: Math.random() * viewportHeight,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        radius: Math.random() * 170 + 110,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.024 + 0.012
      }));

      contourFields = [
        { x: viewportWidth * 0.78, y: viewportHeight * 0.18, radius: 170, color: '#b0c4de', alpha: 0.12, phase: 0.4, speed: 0.0011, parallaxFactor: 0.08 },
        { x: viewportWidth * 0.18, y: viewportHeight * 0.56, radius: 210, color: '#d2b48c', alpha: 0.1, phase: 1.7, speed: 0.0009, parallaxFactor: 0.13 },
        { x: viewportWidth * 0.82, y: viewportHeight * 0.84, radius: 150, color: '#a0a0a0', alpha: 0.095, phase: 3.1, speed: 0.0012, parallaxFactor: 0.18 }
      ];

      flowLines = [
        { x: viewportWidth * 0.08, y: viewportHeight * 0.22, width: viewportWidth * 0.42, height: 120, color: '#a0a0a0', alpha: 0.12, phase: 0.8, speed: 0.001, parallaxFactor: 0.06 },
        { x: viewportWidth * 0.5, y: viewportHeight * 0.64, width: viewportWidth * 0.4, height: 150, color: '#b0c4de', alpha: 0.11, phase: 2.3, speed: 0.0013, parallaxFactor: 0.14 },
        { x: viewportWidth * 0.15, y: viewportHeight * 0.92, width: viewportWidth * 0.48, height: 100, color: '#d2b48c', alpha: 0.1, phase: 4.1, speed: 0.0009, parallaxFactor: 0.2 }
      ];

      featurePoints = Array.from({ length: 28 }, (_, index) => ({
        x: (viewportWidth * ((index * 37) % 100)) / 100 + (Math.random() - 0.5) * 80,
        y: (viewportHeight * ((index * 23) % 100)) / 100 + (Math.random() - 0.5) * 70,
        size: Math.random() * 2.3 + 1.1,
        color: colors[index % colors.length],
        alpha: Math.random() * 0.16 + 0.1,
        phase: Math.random() * Math.PI * 2,
        parallaxFactor: 0.05 + (index % 5) * 0.025
      }));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = Math.floor(viewportWidth * ratio);
      canvas.height = Math.floor(viewportHeight * ratio);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      seedScene();
    };

    const drawGrid = () => {
      const grid = 88;
      const offset = -(scrollYRef.current * 0.035) % grid;
      ctx.save();
      ctx.strokeStyle = `#a0a0a0${alphaHex(0.055)}`;
      ctx.lineWidth = 1;

      for (let x = 0; x <= viewportWidth + grid; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, viewportHeight);
        ctx.stroke();
      }

      for (let y = offset; y <= viewportHeight + grid; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(viewportWidth, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawContour = (field: ContourField) => {
      field.phase += field.speed * motionScale;
      const y = wrapY(field.y - scrollYRef.current * field.parallaxFactor, field.radius + 220);
      const mouseDX = (mouseRef.current.x - 0.5) * 12;
      const mouseDY = (mouseRef.current.y - 0.5) * 10;

      ctx.save();
      ctx.translate(field.x + mouseDX, y + mouseDY);
      ctx.strokeStyle = `${field.color}${alphaHex(field.alpha)}`;
      ctx.lineWidth = 1;

      for (let layer = 0; layer < 7; layer++) {
        const layerRadius = field.radius * (0.35 + layer * 0.095);
        ctx.beginPath();

        for (let step = 0; step <= 96; step++) {
          const angle = (Math.PI * 2 * step) / 96;
          const wave =
            Math.sin(angle * 3 + field.phase + layer * 0.7) * 0.08 +
            Math.cos(angle * 5 - field.phase * 0.8) * 0.045;
          const rx = layerRadius * (1 + wave);
          const ry = layerRadius * (0.58 + Math.sin(field.phase + layer) * 0.025 + wave * 0.55);
          const x = Math.cos(angle) * rx;
          const pointY = Math.sin(angle) * ry;

          if (step === 0) ctx.moveTo(x, pointY);
          else ctx.lineTo(x, pointY);
        }

        ctx.closePath();
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawFlowLine = (line: FlowLine) => {
      line.phase += line.speed * motionScale;
      const y = wrapY(line.y - scrollYRef.current * line.parallaxFactor, line.height + 260);

      ctx.save();
      ctx.strokeStyle = `${line.color}${alphaHex(line.alpha)}`;
      ctx.fillStyle = `${line.color}${alphaHex(line.alpha * 1.4)}`;
      ctx.lineWidth = 1;

      for (let i = 0; i < 3; i++) {
        const localY = y + Math.sin(line.phase + i) * 18 + i * 16;
        ctx.beginPath();
        ctx.moveTo(line.x, localY);
        ctx.bezierCurveTo(
          line.x + line.width * 0.28,
          localY - line.height * 0.6,
          line.x + line.width * 0.62,
          localY + line.height * 0.5,
          line.x + line.width,
          localY + Math.cos(line.phase + i) * 20
        );
        ctx.stroke();

        const t = (line.phase * 0.18 + i * 0.27) % 1;
        const px = line.x + line.width * t;
        const py = localY + Math.sin(t * Math.PI * 2 + line.phase) * line.height * 0.18;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawFeaturePoint = (point: FeaturePoint) => {
      point.phase += 0.0012 * motionScale;
      const y = wrapY(point.y - scrollYRef.current * point.parallaxFactor, 180);
      const pulse = 0.7 + Math.sin(point.phase) * 0.3;

      ctx.save();
      ctx.fillStyle = `${point.color}${alphaHex(point.alpha * pulse)}`;
      ctx.beginPath();
      ctx.arc(point.x + Math.cos(point.phase) * 4, y + Math.sin(point.phase * 0.8) * 4, point.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawFeatureGraph = () => {
      ctx.save();
      ctx.lineWidth = 1;

      for (let i = 0; i < featurePoints.length; i++) {
        const a = featurePoints[i];
        const ay = wrapY(a.y - scrollYRef.current * a.parallaxFactor, 180);

        for (let j = i + 1; j < featurePoints.length; j++) {
          const b = featurePoints[j];
          const by = wrapY(b.y - scrollYRef.current * b.parallaxFactor, 180);
          const dx = a.x - b.x;
          const dy = ay - by;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 148) continue;

          ctx.strokeStyle = `#1a1a1a${alphaHex(0.038 * (1 - distance / 148))}`;
          ctx.beginPath();
          ctx.moveTo(a.x, ay);
          ctx.lineTo(b.x, by);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);

      drawGrid();

      particles.forEach((particle) => {
        particle.x += particle.vx * motionScale;
        particle.y += particle.vy * motionScale;

        const dx = mouseRef.current.x * viewportWidth - particle.x;
        const dy = mouseRef.current.y * viewportHeight - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 320) {
          particle.vx += dx * 0.00004 * motionScale;
          particle.vy += dy * 0.00004 * motionScale;
        }

        if (particle.x < -particle.radius) particle.x = viewportWidth + particle.radius;
        if (particle.x > viewportWidth + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = viewportHeight + particle.radius;
        if (particle.y > viewportHeight + particle.radius) particle.y = -particle.radius;

        particle.vx *= 0.99;
        particle.vy *= 0.99;

        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius);
        gradient.addColorStop(0, `${particle.color}${alphaHex(particle.alpha)}`);
        gradient.addColorStop(1, `${particle.color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      contourFields.forEach(drawContour);
      flowLines.forEach(drawFlowLine);
      drawFeatureGraph();
      featurePoints.forEach(drawFeaturePoint);

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = {
        x: event.clientX / viewportWidth,
        y: event.clientY / viewportHeight
      };
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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
        opacity: 1
      }}
      aria-hidden="true"
    />
  );
}
