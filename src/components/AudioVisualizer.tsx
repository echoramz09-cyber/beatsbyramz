import { useEffect, useRef } from 'react';
import AudioEngine from '../utils/AudioEngine';

interface AudioVisualizerProps {
  className?: string;
  color?: string;
  barsCount?: number;
  barWidth?: number;
  gap?: number;
}

export default function AudioVisualizer({ 
  className = '', 
  color = '#f59e0b',
  barsCount,
  barWidth = 2.5,
  gap = 2
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let BAR_COUNT = barsCount || 24;
    let smoothedBars = new Float32Array(BAR_COUNT).fill(2.5);
    const dataArray = new Uint8Array(128);

    let width = 240;
    let height = 28;
    let resizeRafId: number | null = null;

    const applyCanvasDimensions = (newWidth: number, newHeight: number) => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.max(20, Math.floor(newWidth || 240));
      const targetHeight = Math.max(10, Math.floor(newHeight || 28));

      if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
        canvas.width = targetWidth * dpr;
        canvas.height = targetHeight * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      width = targetWidth;
      height = targetHeight;

      // Auto-compute bars to fill available width if barsCount is not specified
      if (!barsCount) {
        const computedBars = Math.max(10, Math.floor((width + gap) / (barWidth + gap)));
        if (computedBars !== BAR_COUNT) {
          BAR_COUNT = computedBars;
          smoothedBars = new Float32Array(BAR_COUNT).fill(3);
        }
      }
    };

    const initialRect = canvas.getBoundingClientRect();
    applyCanvasDimensions(initialRect.width || 240, initialRect.height || 28);

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
          for (let i = 0; i < 32; i++) {
            if (dataArray[i] > 8) {
              hasRealFft = true;
              break;
            }
          }
        } catch {
          hasRealFft = false;
        }
      }

      const now = Date.now() * 0.003;

      for (let i = 0; i < BAR_COUNT; i++) {
        let targetHeight = 3;

        if (isPlaying) {
          if (hasRealFft) {
            const sampleIdx = Math.min(dataArray.length - 1, Math.floor(Math.pow(i / BAR_COUNT, 1.25) * 48));
            const rawVal = dataArray[sampleIdx] || 0;
            const normVal = rawVal / 255;
            
            // Musical EQ curve: bass kick weight on low/mid, punchy peaks
            const eqWeight = 0.7 + 0.35 * Math.sin((i / BAR_COUNT) * Math.PI);
            targetHeight = Math.max(3, normVal * height * 0.92 * eqWeight);
          } else {
            // High energy pulsating groove wave when playing
            const wave1 = Math.sin(now * 2.2 + i * 0.4) * 0.5 + 0.5;
            const wave2 = Math.cos(now * 1.4 + i * 0.25) * 0.5 + 0.5;
            const wave3 = Math.sin(now * 4.0 + (i % 4) * 0.8) * 0.3 + 0.3;
            const combined = (wave1 * 0.45 + wave2 * 0.3 + wave3 * 0.25);
            targetHeight = 3 + combined * (height * 0.75);
          }
        } else {
          // Subtle resting ambient pulse
          const restingWave = Math.sin(now * 0.8 + i * 0.4) * 0.5 + 0.5;
          targetHeight = 2.5 + restingWave * (height * 0.15);
        }

        // Snappy rise, smooth release for great beat response
        if (targetHeight > smoothedBars[i]) {
          smoothedBars[i] = smoothedBars[i] * 0.4 + targetHeight * 0.6;
        } else {
          smoothedBars[i] = smoothedBars[i] * 0.82 + targetHeight * 0.18;
        }
      }

      // Render the bars - centered across the width
      const totalWidth = BAR_COUNT * barWidth + (BAR_COUNT - 1) * gap;
      const startX = Math.max(0, (width - totalWidth) / 2);

      for (let i = 0; i < BAR_COUNT; i++) {
        const bHeight = Math.min(height, Math.max(2.5, smoothedBars[i]));
        const x = startX + i * (barWidth + gap);
        const y = height - bHeight;

        if (isPlaying) {
          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, 'rgba(217, 119, 6, 0.4)');
          grad.addColorStop(0.5, '#fbbf24');
          grad.addColorStop(1, '#fef08a');

          ctx.fillStyle = grad;
          
          if (bHeight > height * 0.4) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#f59e0b';
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        }

        const radius = Math.min(barWidth / 2, 1.5);
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, bHeight, [radius, radius, 0, 0]);
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
  }, [color, barsCount, barWidth, gap]);

  return (
    <canvas 
      ref={canvasRef} 
      id="equalizer-canvas"
      className={`block opacity-90 transition-opacity duration-300 ${className}`} 
    />
  );
}
