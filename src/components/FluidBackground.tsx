import { useEffect, useRef } from 'react';

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

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const scrollYRef = useRef(0);
  const documentHeightRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionScale = prefersReducedMotion ? 0.16 : 1;
    let contourFields: ContourField[] = [];
    let flowLines: FlowLine[] = [];
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let documentHeight = document.documentElement.scrollHeight;

    const alphaHex = (alpha: number) => Math.floor(alpha * 255).toString(16).padStart(2, '0');

    // Convert absolute Y position to viewport-relative position with parallax
    // Returns null if element is outside viewport (with margin)
    const toViewportY = (absoluteY: number, parallaxFactor: number, margin: number = 300): number | null => {
      // Parallax: higher parallaxFactor = element is further = moves less with scroll
      // Like looking out a car window: distant mountains move slowly, nearby trees move fast
      const viewportY = absoluteY - scrollYRef.current * (1 - parallaxFactor);
      
      // Check if element is visible in viewport (with margin)
      if (viewportY < -margin || viewportY > viewportHeight + margin) {
        return null;
      }
      return viewportY;
    };

    const seedScene = () => {
      // Contour fields: DEEP layer (parallaxFactor 0.65-0.95)
      // Higher parallaxFactor = moves less = appears further away
      contourFields = [
        { x: viewportWidth * 0.78, y: documentHeight * 0.05, radius: 170, color: '#90b4ce', alpha: 0.28, phase: 0.4, speed: 0.0011, parallaxFactor: 0.65 + Math.random() * 0.30 },
        { x: viewportWidth * 0.18, y: documentHeight * 0.18, radius: 210, color: '#b8986c', alpha: 0.24, phase: 1.7, speed: 0.0009, parallaxFactor: 0.68 + Math.random() * 0.27 },
        { x: viewportWidth * 0.82, y: documentHeight * 0.32, radius: 150, color: '#7a7a7a', alpha: 0.22, phase: 3.1, speed: 0.0012, parallaxFactor: 0.70 + Math.random() * 0.25 },
        { x: viewportWidth * 0.45, y: documentHeight * 0.45, radius: 180, color: '#90b4ce', alpha: 0.20, phase: 2.1, speed: 0.0010, parallaxFactor: 0.66 + Math.random() * 0.29 },
        { x: viewportWidth * 0.25, y: documentHeight * 0.58, radius: 160, color: '#b8986c', alpha: 0.26, phase: 0.8, speed: 0.0011, parallaxFactor: 0.67 + Math.random() * 0.28 },
        { x: viewportWidth * 0.68, y: documentHeight * 0.72, radius: 190, color: '#7a7a7a', alpha: 0.23, phase: 1.2, speed: 0.0009, parallaxFactor: 0.69 + Math.random() * 0.26 },
        { x: viewportWidth * 0.35, y: documentHeight * 0.85, radius: 175, color: '#90b4ce', alpha: 0.25, phase: 2.5, speed: 0.0010, parallaxFactor: 0.65 + Math.random() * 0.30 },
        { x: viewportWidth * 0.88, y: documentHeight * 0.95, radius: 145, color: '#b8986c', alpha: 0.21, phase: 3.8, speed: 0.0012, parallaxFactor: 0.68 + Math.random() * 0.27 }
      ];

      // Flow lines: MID layer (parallaxFactor 0.25-0.55)
      // Moderate parallaxFactor = moderate movement = mid-depth
      flowLines = [
        { x: viewportWidth * 0.08, y: documentHeight * 0.03, width: viewportWidth * 0.42, height: 120, color: '#7a7a7a', alpha: 0.28, phase: 0.8, speed: 0.001, parallaxFactor: 0.25 + Math.random() * 0.30 },
        { x: viewportWidth * 0.5, y: documentHeight * 0.12, width: viewportWidth * 0.4, height: 150, color: '#90b4ce', alpha: 0.26, phase: 2.3, speed: 0.0013, parallaxFactor: 0.28 + Math.random() * 0.27 },
        { x: viewportWidth * 0.15, y: documentHeight * 0.22, width: viewportWidth * 0.48, height: 100, color: '#b8986c', alpha: 0.24, phase: 4.1, speed: 0.0009, parallaxFactor: 0.30 + Math.random() * 0.25 },
        { x: viewportWidth * 0.55, y: documentHeight * 0.35, width: viewportWidth * 0.35, height: 130, color: '#7a7a7a', alpha: 0.22, phase: 1.5, speed: 0.0011, parallaxFactor: 0.26 + Math.random() * 0.29 },
        { x: viewportWidth * 0.25, y: documentHeight * 0.48, width: viewportWidth * 0.45, height: 110, color: '#90b4ce', alpha: 0.20, phase: 3.2, speed: 0.001, parallaxFactor: 0.27 + Math.random() * 0.28 },
        { x: viewportWidth * 0.72, y: documentHeight * 0.55, width: viewportWidth * 0.38, height: 140, color: '#b8986c', alpha: 0.25, phase: 0.6, speed: 0.0012, parallaxFactor: 0.29 + Math.random() * 0.26 },
        { x: viewportWidth * 0.08, y: documentHeight * 0.68, width: viewportWidth * 0.52, height: 115, color: '#7a7a7a', alpha: 0.23, phase: 2.0, speed: 0.001, parallaxFactor: 0.25 + Math.random() * 0.30 },
        { x: viewportWidth * 0.42, y: documentHeight * 0.78, width: viewportWidth * 0.42, height: 125, color: '#90b4ce', alpha: 0.27, phase: 3.5, speed: 0.0011, parallaxFactor: 0.28 + Math.random() * 0.27 },
        { x: viewportWidth * 0.18, y: documentHeight * 0.88, width: viewportWidth * 0.35, height: 105, color: '#b8986c', alpha: 0.22, phase: 1.1, speed: 0.0009, parallaxFactor: 0.30 + Math.random() * 0.25 },
        { x: viewportWidth * 0.62, y: documentHeight * 0.97, width: viewportWidth * 0.48, height: 135, color: '#7a7a7a', alpha: 0.24, phase: 2.8, speed: 0.001, parallaxFactor: 0.26 + Math.random() * 0.29 }
      ];
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      documentHeight = document.documentElement.scrollHeight;
      documentHeightRef.current = documentHeight;
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
      ctx.strokeStyle = `#5a5a5a${alphaHex(0.15)}`;
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
      const viewportY = toViewportY(field.y, field.parallaxFactor, field.radius + 220);
      if (viewportY === null) return; // Skip if outside viewport
      
      // Mouse parallax: higher parallaxFactor = element is further = moves less with mouse
      const mouseDX = (mouseRef.current.x - 0.5) * 24 * (1 - field.parallaxFactor);
      const mouseDY = (mouseRef.current.y - 0.5) * 20 * (1 - field.parallaxFactor);

      ctx.save();
      ctx.translate(field.x + mouseDX, viewportY + mouseDY);
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
      const viewportY = toViewportY(line.y, line.parallaxFactor, line.height + 260);
      if (viewportY === null) return; // Skip if outside viewport

      // Mouse parallax: higher parallaxFactor = element is further = moves less with mouse
      const mouseDX = (mouseRef.current.x - 0.5) * 24 * (1 - line.parallaxFactor);
      const mouseDY = (mouseRef.current.y - 0.5) * 20 * (1 - line.parallaxFactor);

      ctx.save();
      ctx.translate(mouseDX, mouseDY);
      ctx.strokeStyle = `${line.color}${alphaHex(line.alpha)}`;
      ctx.fillStyle = `${line.color}${alphaHex(line.alpha * 1.4)}`;
      ctx.lineWidth = 1;

      for (let i = 0; i < 3; i++) {
        const localY = viewportY + Math.sin(line.phase + i) * 18 + i * 16;
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

    const animate = () => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);

      drawGrid();

      contourFields.forEach(drawContour);
      flowLines.forEach(drawFlowLine);

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    const handleResize = () => {
      // Check if document height changed (content loaded, etc.)
      const newDocumentHeight = document.documentElement.scrollHeight;
      if (newDocumentHeight !== documentHeightRef.current) {
        documentHeight = newDocumentHeight;
        documentHeightRef.current = newDocumentHeight;
        seedScene();
      }
      resize();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = {
        x: event.clientX / viewportWidth,
        y: event.clientY / viewportHeight
      };
    };

    resize();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
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
