import { useEffect, useRef } from 'react';
import AudioEngine from '../utils/AudioEngine';

interface AudioVisualizerProps {
  className?: string;
  color?: string;
}

export default function AudioVisualizer({ className = '', color = 'rgba(234, 179, 8, 1)' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BAR_COUNT = 16;
    const smoothedBars = new Float32Array(BAR_COUNT).fill(3);
    const dataArray = new Uint8Array(128);

    let width = 300;
    let height = 40;
    let resizeRafId: number | null = null;

    const applyCanvasDimensions = (newWidth: number, newHeight: number) => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.max(10, Math.floor(newWidth));
      const targetHeight = Math.max(10, Math.floor(newHeight));

      if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
        canvas.width = targetWidth * dpr;
        canvas.height = targetHeight * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = targetWidth;
      height = targetHeight;
    };

    const initialRect = canvas.getBoundingClientRect();
    applyCanvasDimensions(initialRect.width || 300, initialRect.height || 40);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const contentWidth = entry.contentRect.width;
      const contentHeight = entry.contentRect.height;

      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
      resizeRafId = requestAnimationFrame(() => {
        applyCanvasDimensions(contentWidth, contentHeight);
      });
    });

    resizeObserver.observe(canvas);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const analyser = AudioEngine.getAnalyser();
      const isPlaying = AudioEngine.getIsPlaying();

      ctx.clearRect(0, 0, width, height);

      let hasRealFft = false;

      if (analyser && isPlaying) {
        try {
          analyser.getByteFrequencyData(dataArray);
          // Check for genuine audio energy in the primary spectrum
          for (let i = 0; i < 32; i++) {
            if (dataArray[i] > 10) {
              hasRealFft = true;
              break;
            }
          }
        } catch (e) {
          hasRealFft = false;
        }
      }

      const now = Date.now() * 0.003;

      for (let i = 0; i < BAR_COUNT; i++) {
        let targetHeight = 3;

        if (isPlaying) {
          if (hasRealFft) {
            // Real audio spectrum data with EQ shaping (boost low/mid, gently taper high)
            const sampleIdx = Math.min(dataArray.length - 1, Math.floor(Math.pow(i / BAR_COUNT, 1.4) * 48));
            const rawVal = dataArray[sampleIdx] || 0;
            const normVal = rawVal / 255;
            
            // Musical EQ curve shaping: center weighted punch, max 60% of height for sleek look
            const eqWeight = 0.6 + 0.4 * Math.sin((i / BAR_COUNT) * Math.PI);
            targetHeight = Math.max(3, normVal * height * 0.55 * eqWeight);
          } else {
            // Smooth, elegant gentle wave when buffering or loading audio (subtle and short)
            const wave1 = Math.sin(now * 1.5 + i * 0.35) * 0.5 + 0.5;
            const wave2 = Math.cos(now * 0.8 + i * 0.2) * 0.5 + 0.5;
            const combined = (wave1 * 0.65 + wave2 * 0.35);
            targetHeight = 3 + combined * (height * 0.22);
          }
        } else {
          // Subtle resting ambient pulse when paused
          const restingWave = Math.sin(now * 0.6 + i * 0.4) * 0.5 + 0.5;
          targetHeight = 2.5 + restingWave * (height * 0.08);
        }

        // Smooth interpolation between frames for fluid animation
        smoothedBars[i] = smoothedBars[i] * 0.75 + targetHeight * 0.25;
      }

      // Render the bars - centered horizontally in canvas with compact spacing
      const barWidth = 3;
      const gap = 2.5;
      const totalWidth = BAR_COUNT * barWidth + (BAR_COUNT - 1) * gap;
      const startX = Math.max(0, (width - totalWidth) / 2);

      for (let i = 0; i < BAR_COUNT; i++) {
        const barHeight = Math.min(height - 1, Math.max(2.5, smoothedBars[i]));
        const x = startX + i * (barWidth + gap);
        const y = height - barHeight;

        if (isPlaying) {
          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, 'rgba(180, 120, 10, 0.3)');
          grad.addColorStop(0.5, color);
          grad.addColorStop(1, 'rgba(253, 224, 71, 0.95)');

          ctx.fillStyle = grad;
          
          if (barHeight > height * 0.45) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = color;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        }

        const radius = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
      resizeObserver.disconnect();
    };
  }, [color]);

  return (
    <canvas 
      ref={canvasRef} 
      id="equalizer-canvas"
      className={`w-full h-full block opacity-90 hover:opacity-100 transition-opacity duration-300 ${className}`} 
    />
  );
}
