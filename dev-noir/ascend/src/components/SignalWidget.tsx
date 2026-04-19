import { useEffect, useRef } from 'react';

export default function SignalWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 2;
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      }
    }

    const init = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 40 }, () => new Particle(w, h));
    };

    const drawLine = (p1: Particle, p2: Particle) => {
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (dist < 80) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 80)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      particles.forEach((p, i) => {
        p.update(w, h);
        p.draw(ctx);
        for (let j = i + 1; j < particles.length; j++) {
          drawLine(p, particles[j]);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="ascend-glass rounded-[24px] h-[200px] flex flex-col relative overflow-hidden bg-black/50 border-fire/10">
      <div className="absolute top-6 left-8 flex items-center gap-3 z-10">
         <div className="w-1.5 h-1.5 rounded-full bg-fire fire-glow animate-pulse" />
         <span className="text-[10px] font-bold tracking-[0.4em] text-fire uppercase">SIGNAL / COMPUTATION</span>
      </div>
      
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />

      <div className="absolute bottom-6 right-8 flex items-center gap-1.5 z-10 opacity-40">
         <div className="w-1 h-2 bg-fire/40 rounded-full" />
         <div className="w-1 h-3.5 bg-fire/60 rounded-full" />
         <div className="w-1 h-2 bg-fire/40 rounded-full" />
      </div>
    </div>
  );
}
