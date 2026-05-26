import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;      // 0→1, decreasing
  lifeStep: number;  // how much life decays per frame
  size: number;
  color: string;
  type: 'heart' | 'sparkle' | 'dot';
  rot: number;
  rotSpeed: number;
}

// Pre-compute a unit heart Path2D once — reused every frame, much faster than rebuilding bezier paths
const HEART_PATH = new Path2D(
  'M 0 3 C 0 0 -10 0 -10 -7 C -10 -16 0 -17 0 -9 C 0 -17 10 -16 10 -7 C 10 0 0 0 0 3 Z'
);

const HEART_COLORS   = ['#ff4d4d', '#e50914', '#ff8080'];
const SPARKLE_COLORS = ['#d4af37', '#ffdf7a', '#fff8e7'];
const DOT_COLORS     = ['#ffffff', '#ffb3d9', '#ffdf7a', '#ff4d4d'];

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle pool — plain array, never touches React state
    const particles: Particle[] = [];
    let lastX = 0, lastY = 0;

    const TYPES = ['heart', 'sparkle', 'dot'] as const;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy < 144) return; // 12px threshold
      lastX = e.clientX;
      lastY = e.clientY;

      const type = TYPES[Math.floor(Math.random() * 3)];
      const colors = type === 'heart' ? HEART_COLORS : type === 'sparkle' ? SPARKLE_COLORS : DOT_COLORS;

      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(Math.random() * 1.8 + 0.8),
        life: 1,
        lifeStep: 1 / (40 + Math.random() * 20), // ~40–60 frames lifetime
        size: type === 'dot'
          ? Math.random() * 5 + 3
          : Math.random() * 10 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        type,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
      });

      // Hard cap — splice from front if over budget
      if (particles.length > 45) particles.splice(0, particles.length - 45);
    };
    window.addEventListener('mousemove', onMouseMove);

    // Touch support — same logic, just extract first touch point
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMouseMove({ clientX: t.clientX, clientY: t.clientY } as MouseEvent);
    };
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // ── Draw helpers ──────────────────────────────────────────────────────────

    const drawHeart = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const s = p.size / 10;
      ctx.scale(s, s);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill(HEART_PATH);
      ctx.restore();
    };

    const drawSparkle = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      const s = p.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(-s, 0);   ctx.lineTo(s, 0);
      ctx.moveTo(0, -s);   ctx.lineTo(0, s);
      ctx.moveTo(-s * .7, -s * .7); ctx.lineTo(s * .7, s * .7);
      ctx.moveTo(s * .7, -s * .7);  ctx.lineTo(-s * .7, s * .7);
      ctx.stroke();
      ctx.restore();
    };

    const drawDot = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ── Main rAF loop ─────────────────────────────────────────────────────────
    let frameId: number;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotSpeed;
        p.life -= p.lifeStep;

        if (p.life <= 0) { particles.splice(i, 1); continue; }

        // Fade in for first 20% of life, fade out for last 30%
        const alpha = p.life < 0.3
          ? p.life / 0.3
          : p.life > 0.8 ? (1 - p.life) / 0.2 : 1;

        if      (p.type === 'heart')   drawHeart(p, alpha * 0.9);
        else if (p.type === 'sparkle') drawSparkle(p, alpha * 0.9);
        else                           drawDot(p, alpha * 0.85);
      }

      frameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
}
