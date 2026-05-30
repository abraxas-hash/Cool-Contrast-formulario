import { useEffect, useRef, useCallback } from 'react';

const ElectricScreenHalo = ({
  color = '#00d2ff', // Electric cyan
  speed = 2.0,       // Fast crackling speed
  chaos = 0.12,      // Symmetrical chaos matching card borders
  displacement = 14  // High-voltage filament amplitude
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

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
    (x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed) => {
      let y = 0;
      let amplitude = baseAmplitude;
      let frequency = baseFrequency;

      for (let i = 0; i < octaves; i++) {
        y += amplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
        frequency *= lacunarity;
        amplitude *= gain;
      }

      return y;
    },
    [noise2D]
  );

  const getRectPoint = useCallback((progress, width, height) => {
    const inset = 6; // Subtle inset to prevent clipping
    const w = width - 2 * inset;
    const h = height - 2 * inset;
    const totalPerimeter = 2 * w + 2 * h;
    const distance = progress * totalPerimeter;

    // Top edge
    if (distance <= w) {
      return { x: inset + distance, y: inset };
    }
    // Right edge
    if (distance <= w + h) {
      return { x: inset + w, y: inset + (distance - w) };
    }
    // Bottom edge
    if (distance <= 2 * w + h) {
      return { x: inset + w - (distance - (w + h)), y: inset + h };
    }
    // Left edge
    return { x: inset, y: inset + h - (distance - (2 * w + h)) };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Symmetrical noise tuning parameters
    const octaves = 10;
    const lacunarity = 1.6;
    const gain = 0.7;
    const frequency = 10;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const updateSize = () => {
      const currentW = window.innerWidth;
      const currentH = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = currentW * dpr;
      canvas.height = currentH * dpr;
      canvas.style.width = `${currentW}px`;
      canvas.style.height = `${currentH}px`;
      ctx.scale(dpr, dpr);
      
      w = currentW;
      h = currentH;
    };

    updateSize();

    const drawElectricHalo = currentTime => {
      if (!canvas || !ctx) return;

      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
      timeRef.current += deltaTime * speed;
      lastFrameTimeRef.current = currentTime;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      // Higher sample count for razor-sharp crackling lightning paths
      const sampleCount = Math.floor((2 * w + 2 * h) / 2);
      
      const globalFlicker = 0.85 + Math.random() * 0.15;

      // Scale noise frequency with physical screen perimeter to keep the crackle texture size
      // exactly matching the cards (approx. 1 wave cycle per 85 pixels)
      const perimeter = 2 * w + 2 * h;
      const noiseScale = perimeter / 85;

      const drawRay = (displacementScale, seedOffset, alpha, strokeCol, lineWidth, shadowBlurVal) => {
        ctx.beginPath();
        
        for (let i = 0; i <= sampleCount; i++) {
          const progress = i / sampleCount;
          const point = getRectPoint(progress, w, h);

          const xNoise = octavedNoise(
            progress * noiseScale,
            octaves,
            lacunarity,
            gain,
            chaos,
            frequency,
            timeRef.current,
            seedOffset
          );

          const yNoise = octavedNoise(
            progress * noiseScale,
            octaves,
            lacunarity,
            gain,
            chaos,
            frequency,
            timeRef.current,
            seedOffset + 1
          );

          let displacedX = point.x + xNoise * displacementScale;
          let displacedY = point.y + yNoise * displacementScale;

          // Gentle safety boundary clamping
          displacedX = Math.max(2, Math.min(w - 2, displacedX));
          displacedY = Math.max(2, Math.min(h - 2, displacedY));

          if (i === 0) {
            ctx.moveTo(displacedX, displacedY);
          } else {
            ctx.lineTo(displacedX, displacedY);
          }
        }

        ctx.closePath();
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = alpha * globalFlicker;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (shadowBlurVal > 0) {
          ctx.shadowBlur = shadowBlurVal;
          ctx.shadowColor = strokeCol;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      // 1. Faint, wide ambient glow (Blue/deep cyan)
      drawRay(displacement * 0.8, 0, 0.05, '#0055ff', 20, 24);

      // 2. Soft glowing neon envelope (Main color)
      drawRay(displacement * 0.6, 2, 0.18, color, 8, 10);

      // 3. Sharp glowing electric lightning filament (Main color) - razor sharp 1.8px
      drawRay(displacement * 0.45, 4, 0.95, color, 1.8, 4);

      // 4. Hot white core filament (White) - thin 0.8px
      drawRay(displacement * 0.40, 6, 1.0, '#ffffff', 0.8, 0);

      // Reset shadows
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(drawElectricHalo);
    };

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(drawElectricHalo);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, speed, chaos, displacement, octavedNoise, getRectPoint]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999]" 
    />
  );
};

export default ElectricScreenHalo;
