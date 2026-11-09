import React, { useEffect, useRef } from 'react';

const COLUMNS = 72;
const FONT_SIZE = 14;
const CHARS = '01CYVEX<>/{}[]$#@%&*+=-';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const columns = Math.max(24, Math.floor(window.innerWidth / FONT_SIZE));
    let drops = Array.from({ length: columns }, () => Math.random() * -80);
    let rafId;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from({ length: Math.max(24, Math.floor(window.innerWidth / FONT_SIZE)) }, () => Math.random() * -80);
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.fillStyle = 'rgba(2, 4, 3, 0.09)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px Oxanium, monospace`;
      ctx.fillStyle = '#00ff88';
      drops.forEach((drop, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drop * FONT_SIZE);
        if (drop * FONT_SIZE > height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.35;
      });
      rafId = window.requestAnimationFrame(draw);
    };

    resize();
    if (!reducedMotion) rafId = window.requestAnimationFrame(draw);
    else {
      ctx.fillStyle = 'rgba(2, 4, 3, 1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-20" />;
}
