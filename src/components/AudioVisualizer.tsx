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

    // Handle resizing on first frame
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    });
    resizeObserver.observe(canvas);

    const dataArray = new Uint8Array(128);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const analyser = AudioEngine.getAnalyser();
      const isPlaying = AudioEngine.getIsPlaying();

      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        // Check if dataArray has any non-zero frequency values
        let hasRealData = false;
        for (let i = 0; i < 32; i++) {
          if (dataArray[i] > 0) {
            hasRealData = true;
            break;
          }
        }

        // If no real FFT data available (e.g. cross-domain CORS media restriction),
        // synthesize dynamic beat frequencies based on time and bar index
        if (!hasRealData) {
          const now = Date.now() * 0.009;
          for (let i = 0; i < 24; i++) {
            const pulse = Math.abs(Math.sin(now * 1.8 + i * 0.4)) * 170 + Math.cos(now * 0.9 + i * 0.2) * 45;
            dataArray[i * 2] = Math.min(255, Math.max(15, Math.floor(pulse)));
          }
        }

        // Draw dynamic neon bars
        const barWidth = (width / 24) - 2;
        let x = 0;

        for (let i = 0; i < 24; i++) {
          // Average some values to look cleaner
          const byteVal = dataArray[i * 2] || 0;
          const percentage = byteVal / 255;
          const barHeight = Math.max(4, percentage * height * 0.95);

          // Build gradient
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, 'rgba(180, 120, 10, 0.4)'); // Warm amber base
          grad.addColorStop(0.5, color);                   // Metallic gold accent
          grad.addColorStop(1, 'rgba(253, 224, 71, 0.95)'); // Bright glowing gold top

          ctx.fillStyle = grad;
          
          // Draw rounded bars
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Add a subtle glow on hit
          if (percentage > 0.6) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = color;
          } else {
            ctx.shadowBlur = 0;
          }

          x += barWidth + 2;
        }
      } else {
        // Draw flat rhythmic standby line
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const barWidth = (width / 24) - 2;
        let x = 0;
        for (let i = 0; i < 24; i++) {
          // Simulate subtle standby heartbeat
          const time = Date.now() * 0.003;
          const offsetHeight = 4 + Math.sin(time + i * 0.5) * 2;
          ctx.beginPath();
          ctx.roundRect(x, height - offsetHeight, barWidth, offsetHeight, [2, 2, 0, 0]);
          ctx.fill();
          x += barWidth + 2;
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [color]);

  return (
    <canvas 
      ref={canvasRef} 
      id="equalizer-canvas"
      className={`w-full h-full block opacity-85 hover:opacity-100 transition-opacity duration-300 ${className}`} 
    />
  );
}
