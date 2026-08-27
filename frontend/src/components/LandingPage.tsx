import React, { useEffect, useRef } from 'react';
import { Flame } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle system for floating ember effect
    const particles: { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 0.8 + 0.3),
        life: Math.random(),
        size: Math.random() * 3 + 1,
        hue: Math.random() * 40 + 10
      });
    }

    let animId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(11, 15, 25, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.004;

        if (p.life <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.life = 0.8 + Math.random() * 0.2;
          p.vy = -(Math.random() * 0.8 + 0.3);
        }

        ctx.save();
        ctx.globalAlpha = p.life * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 100%, 60%)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#0B0F19] flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Radial glow behind hero */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-orange-600/10 blur-[120px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-8 px-6">
        {/* Logo mark */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-0.5 shadow-2xl shadow-orange-500/40">
            <div className="w-full h-full bg-[#0B0F19] rounded-[22px] flex items-center justify-center">
              <Flame className="w-10 h-10 text-orange-500 fill-orange-500/30" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
              Flame<span className="text-orange-500">X</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-md tracking-widest">
                COMMAND
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug max-w-lg">
            AI-Powered Thermal Intelligence
          </h2>
          <p className="text-lg text-gray-400 max-w-md font-medium">
            See the heat.{' '}
            <span className="text-orange-400 font-semibold">Understand the source.</span>
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 flex-wrap justify-center">
          {['🛰 Satellite detects heat', '→', '🔍 Investigates location', '→', '🧠 Classifies source', '→', '🚨 Alerts you'].map((s, i) => (
            <span key={i} className={s === '→' ? 'text-orange-600' : 'px-2.5 py-1 rounded-lg bg-gray-900/80 border border-gray-800 text-gray-300'}>
              {s}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          id="enter-dashboard-btn"
          onClick={onEnter}
          className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Flame className="w-5 h-5 fill-white/30" />
            Enter Dashboard
          </span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Stat pills */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {[
            { label: 'NASA FIRMS', sub: 'MODIS + VIIRS' },
            { label: 'ESA WorldCover', sub: 'Land Classification' },
            { label: 'AI Engine', sub: 'Hybrid Classifier' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-2 rounded-xl bg-gray-900/80 border border-gray-800 text-center">
              <div className="text-xs font-bold text-gray-200">{s.label}</div>
              <div className="text-[10px] text-gray-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
