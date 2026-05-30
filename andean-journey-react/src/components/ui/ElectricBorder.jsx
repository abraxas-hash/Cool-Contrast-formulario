import { useEffect, useRef, useCallback, useState } from 'react';
import './ElectricBorder.css';

// Detect mobile once at module level to avoid recalculation
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;

const ElectricBorder = ({
  children,
  color = '#5227FF',
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  displacement = 6, // Default to a tighter, cleaner glow to prevent clipping
  className,
  style
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  
  // Track if the card is currently visible in the viewport to avoid drawing off-screen canvases
  const [isInViewport, setIsInViewport] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Helper to determine hover color dynamically
  const getHoverColor = useCallback((baseColor) => {
    const clean = baseColor.toLowerCase().trim();
    if (clean.startsWith('#38bdf8') || clean.startsWith('#0284c7') || clean.startsWith('#0ea5e9')) return '#f97316'; // Cyan/Blue -> Orange
    if (clean.startsWith('#f97316') || clean.startsWith('#ea580c') || clean.startsWith('#c2410c') || clean.startsWith('#9a3412')) return '#38bdf8'; // Orange -> Sky Blue
    if (clean.startsWith('#10b981') || clean.startsWith('#059669')) return '#fbbf24'; // Green -> Gold
    if (clean.startsWith('#f59e0b') || clean.startsWith('#d97706')) return '#ec4899'; // Gold -> Neon Pink
    if (clean.startsWith('rgba') || clean.startsWith('#fff')) return '#f59e0b'; // Neutral -> Amber
    return '#f59e0b'; // Fallback to vivid amber/yellow
  }, []);

  const activeColor = isHovered ? getHoverColor(color) : color;
  const activeSpeed = isHovered ? speed * 3 : speed;
  const activeChaos = isHovered ? Math.max(0.2, chaos * 1.5) : chaos;

  // Performance settings based on device
  const OCTAVES = isMobile ? 2 : 3;
  const TARGET_FPS = isMobile ? 20 : 30;
  const FRAME_INTERVAL = 1000 / TARGET_FPS;

  // Noise functions
  const random = useCallback(x => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }, []);

  const noise2D = useCallback(
    (x, y) => {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;

      const a = random(i + j * 57);
      const b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57);
      const d = random(i + 1 + (j + 1) * 57);

      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);

      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    },
    [random]
  );

  const octavedNoise = useCallback(
    (x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed, baseFlatness) => {
      let y = 0;
      let amplitude = baseAmplitude;
      let frequency = baseFrequency;

      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amplitude;
        if (i === 0) {
          octaveAmplitude *= baseFlatness;
        }
        y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
        frequency *= lacunarity;
        amplitude *= gain;
      }

      return y;
    },
    [noise2D]
  );

  const getCornerPoint = useCallback((centerX, centerY, radius, startAngle, arcLength, progress) => {
    const angle = startAngle + progress * arcLength;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }, []);

  const getRoundedRectPoint = useCallback(
    (t, left, top, width, height, radius) => {
      const straightWidth = width - 2 * radius;
      const straightHeight = height - 2 * radius;
      const cornerArc = (Math.PI * radius) / 2;
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      const distance = t * totalPerimeter;

      let accumulated = 0;

      // Top edge
      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + radius + progress * straightWidth, y: top };
      }
      accumulated += straightWidth;

      // Top-right corner
      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      // Right edge
      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left + width, y: top + radius + progress * straightHeight };
      }
      accumulated += straightHeight;

      // Bottom-right corner
      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      // Bottom edge
      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + width - radius - progress * straightWidth, y: top + height };
      }
      accumulated += straightWidth;

      // Bottom-left corner
      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      // Left edge
      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left, y: top + height - radius - progress * straightHeight };
      }
      accumulated += straightHeight;

      // Top-left corner
      const progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
    },
    [getCornerPoint]
  );

  // Setup Viewport Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { 
        rootMargin: '100px', // Pre-load 100px before coming into view for smooth transition
        threshold: 0.01 
      }
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Canvas Animation loop - only runs when card is in viewport
  useEffect(() => {
    if (!isInViewport) return; // PAUSE immediately if the card is off-screen!

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration - all constants, computed once
    const octaves = OCTAVES;
    const lacunarity = 1.6;
    const gain = 0.7;
    const amplitude = activeChaos;
    const frequency = 10;
    const baseFlatness = 0;
    const borderOffset = displacement + 6;

    // Cache for geometry values — recomputed only on resize, NOT every frame
    let cachedGeometry = null;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width + borderOffset * 2;
      const height = rect.height + borderOffset * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Pre-compute expensive geometry values once
      const borderWidth = width - 2 * borderOffset;
      const borderHeight = height - 2 * borderOffset;
      const maxRadius = Math.min(borderWidth, borderHeight) / 2;
      const radius = Math.min(borderRadius, maxRadius);
      const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.floor(approximatePerimeter / (isMobile ? 10 : 6));
      const spatialCycles = Math.max(8, approximatePerimeter / 35);

      cachedGeometry = {
        width, height,
        left: borderOffset, top: borderOffset,
        borderWidth, borderHeight, radius,
        sampleCount, spatialCycles
      };

      return cachedGeometry;
    };

    cachedGeometry = updateSize();

    // FPS-throttled draw loop
    let lastDrawTime = 0;
    const drawElectricBorder = currentTime => {
      if (!canvas || !ctx) return;

      // Throttle to TARGET_FPS — skip frame if not enough time has passed
      const elapsed = currentTime - lastDrawTime;
      if (elapsed < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(drawElectricBorder);
        return;
      }
      lastDrawTime = currentTime - (elapsed % FRAME_INTERVAL);

      const deltaTime = elapsed / 1000;
      timeRef.current += deltaTime * activeSpeed;

      if (!cachedGeometry) {
        animationRef.current = requestAnimationFrame(drawElectricBorder);
        return;
      }

      const { width, height, left, top, borderWidth, borderHeight, radius, sampleCount, spatialCycles } = cachedGeometry;

      // Clear canvas
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = isHovered ? 12 : 6;
      ctx.shadowColor = activeColor;

      const scale = displacement;

      ctx.beginPath();

      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;
        const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);

        const xNoise = octavedNoise(
          progress * spatialCycles, octaves, lacunarity, gain,
          amplitude, frequency, timeRef.current, 0, baseFlatness
        );
        const yNoise = octavedNoise(
          progress * spatialCycles, octaves, lacunarity, gain,
          amplitude, frequency, timeRef.current, 1, baseFlatness
        );

        const displacedX = point.x + xNoise * scale;
        const displacedY = point.y + yNoise * scale;

        if (i === 0) ctx.moveTo(displacedX, displacedY);
        else ctx.lineTo(displacedX, displacedY);
      }

      ctx.closePath();
      ctx.stroke();

      animationRef.current = requestAnimationFrame(drawElectricBorder);
    };

    // Handle resize — invalidate cached geometry
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Start animation
    animationRef.current = requestAnimationFrame(drawElectricBorder);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [activeColor, activeSpeed, activeChaos, borderRadius, displacement, octavedNoise, getRoundedRectPoint, isInViewport, OCTAVES, TARGET_FPS, FRAME_INTERVAL]);

  const vars = {
    '--electric-border-color': activeColor,
    borderRadius: borderRadius
  };

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    container.style.setProperty('--mouse-x', `${x}px`);
    container.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`electric-border ${className ?? ''}`} 
      style={{ ...vars, ...style }}
    >
      <div className="eb-canvas-container">
        <canvas ref={canvasRef} className="eb-canvas" />
      </div>
      <div className="eb-layers">
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-background-glow" />
      </div>
      <div className="eb-content">{children}</div>
    </div>
  );
};

export default ElectricBorder;
