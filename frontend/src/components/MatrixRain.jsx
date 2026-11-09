import React, { useEffect, useRef } from 'react';

const CHARACTERS = '01CYVEX<>/{}[]$#@%&*+=-';

export default function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    let drops = [];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drops = Array.from({ length: Math.max(20, Math.floor(window.innerWidth / 16)) }, () => Math.random() * -60);
    };
    const draw = () => {
      ctx.fillStyle = 'rgba(2, 4, 3, 0.1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = '14px Oxanium, monospace';
      ctx.fillStyle = '#00ff88';
      drops.forEach((y, x) => {
        ctx.fillText(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)], x * 16, y * 16);
        drops[x] = y * 16 > window.innerHeight && Math.random() > 0.975 ? 0 : y + 0.35;
      });
      raf = window.requestAnimationFrame(draw);
    };
    resize();
    if (!reduced) raf = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => { window.cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-20" />;
}
