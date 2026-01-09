
import React, { useEffect, useRef } from 'react';

export const VoiceVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ef4444'; // Red-500

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      for (let x = 0; x < width; x++) {
        const y = mid + Math.sin(x * 0.05 + offset) * 15 * Math.sin(offset * 0.1);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      offset += 0.15;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={60} 
      className={`mx-auto transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
