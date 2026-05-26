import { useEffect, useRef } from 'react';

// Pre-compute heart Path2D once — used with ctx.fill() every frame, no bezier rebuild cost
const HEART_PATH = new Path2D(
  'M 0 5 C 0 0 -15 0 -15 -10 C -15 -20 0 -25 0 -10 C 0 -25 15 -20 15 -10 C 15 0 0 0 0 5 Z'
);

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];

    // ── Reduced star count: 250 (was 800) ────────────────────────────────────
    const NUM_STARS = 250;

    class Star {
      x = 0; y = 0; z = 0;
      size = 0; color = ''; velocity = 0;
      pulse = 0; pulseSpeed = 0;
      spin = 0;
      type: 'heart' | 'dot' = 'dot';

      constructor() {
        this.reset();
        this.z = Math.random() * window.innerWidth;
      }

      reset() {
        const angle  = Math.random() * Math.PI * 2;
        const radius = Math.random() * window.innerWidth * 1.5;
        this.x        = Math.cos(angle) * radius;
        this.y        = Math.sin(angle) * radius;
        this.z        = window.innerWidth;
        this.spin     = Math.random() * Math.PI * 2;
        this.size     = Math.random() * 20 + 12;
        this.velocity = Math.random() * 0.5 + 0.25;
        this.pulse     = Math.random() * Math.PI;
        this.pulseSpeed = Math.random() * 0.04 + 0.02;

        // 30% hearts, 70% dots — reduced from 65% complex shapes
        if (Math.random() > 0.70) {
          this.type  = 'heart';
          this.color = ['#ff4d4d', '#ff1a1a', '#ffb7b7'][Math.floor(Math.random() * 3)];
        } else {
          this.type  = 'dot';
          this.color = Math.random() > 0.5 ? '#d4af37' : '#ffffff';
        }
      }

      update() {
        this.z    -= this.velocity;
        this.pulse += this.pulseSpeed;
        this.spin  += 0.008; // slightly slower spin (was 0.01)

        if (this.z <= 0) { this.reset(); return; }

        const mx = (mouseRef.current.x - window.innerWidth  / 2) * 0.03; // reduced parallax (was 0.05)
        const my = (mouseRef.current.y - window.innerHeight / 2) * 0.03;

        const time = Date.now() * 0.00008; // slower rotation (was 0.0001)
        const rx = this.x * Math.cos(time) - this.y * Math.sin(time);
        const ry = this.x * Math.sin(time) + this.y * Math.cos(time);

        const k  = 200 / this.z;
        const px = (rx + mx) * k + window.innerWidth  / 2;
        const py = (ry + my) * k + window.innerHeight / 2;

        const baseOpacity  = Math.min(1, (1 - this.z / window.innerWidth) * 1.5);
        const alpha        = baseOpacity * (0.6 + Math.sin(this.pulse) * 0.4);
        const currentSize  = Math.max(1.5, this.size * k * 0.1);

        ctx!.globalAlpha = alpha;
        ctx!.fillStyle   = this.color;

        if (this.type === 'heart') {
          // Use pre-computed Path2D — no bezier rebuild each frame
          ctx!.save();
          ctx!.translate(px, py);
          ctx!.rotate(this.spin);
          ctx!.scale(currentSize / 30, currentSize / 30);
          ctx!.fill(HEART_PATH);
          ctx!.restore();
        } else {
          // Simple arc — cheapest possible draw call
          ctx!.beginPath();
          ctx!.arc(px, py, Math.max(1, currentSize / 6), 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.globalAlpha = 1;
      }
    }

    class ShootingStar {
      x = 0; y = 0; len = 0; speed = 0; opacity = 0; active = false;

      constructor() { this.reset(); }

      reset() {
        this.x       = Math.random() * window.innerWidth + window.innerWidth * 0.5;
        this.y       = Math.random() * window.innerHeight * 0.2;
        this.len     = Math.random() * 150 + 50;
        this.speed   = Math.random() * 14 + 8;
        this.opacity = 0;
        this.active  = false;
      }

      start() { this.active = true; }

      update() {
        if (!this.active) return;
        this.x       -= this.speed;
        this.y       += this.speed * 0.3;
        this.opacity += 0.012;

        if (this.x < -this.len || this.y > window.innerHeight) { this.reset(); return; }

        const grad = ctx!.createLinearGradient(this.x, this.y, this.x + this.len, this.y - this.len * 0.3);
        grad.addColorStop(0, `rgba(255,255,255,${Math.min(1, this.opacity)})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx!.strokeStyle = grad;
        ctx!.lineWidth   = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(this.x, this.y);
        ctx!.lineTo(this.x + this.len, this.y - this.len * 0.3);
        ctx!.stroke();
      }
    }

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      stars         = Array.from({ length: NUM_STARS }, () => new Star());
      shootingStars = Array.from({ length: 3 }, () => new ShootingStar());
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize',    resize);
    window.addEventListener('mousemove', onMouseMove);
    resize();

    // ── rAF draw loop ─────────────────────────────────────────────────────────
    const draw = () => {
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.0003;
      const mx   = (mouseRef.current.x - canvas.width  / 2) * 0.08;
      const my   = (mouseRef.current.y - canvas.height / 2) * 0.08;

      // Nebula layers — unchanged, very cheap (just radial gradient fills)
      const drawNebula = (x: number, y: number, r: number, c1: string, c2: string) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };

      drawNebula(
        canvas.width  * 0.5 + Math.sin(time) * 100 + mx,
        canvas.height * 0.5 + Math.cos(time * 0.8) * 100 + my,
        canvas.width  * 0.8,
        'rgba(80,0,20,0.15)', 'rgba(0,0,0,0)'
      );
      drawNebula(
        canvas.width  * 0.3 + Math.cos(time * 0.5) * 150 - mx,
        canvas.height * 0.7 + Math.sin(time * 0.6) * 120 - my,
        canvas.width  * 0.6,
        'rgba(20,0,60,0.12)', 'rgba(0,0,0,0)'
      );

      stars.forEach(s => s.update());

      if (Math.random() > 0.995) {
        const idle = shootingStars.find(s => !s.active);
        if (idle) idle.start();
      }
      shootingStars.forEach(s => s.update());

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none bg-black"
      aria-hidden="true"
    />
  );
}
