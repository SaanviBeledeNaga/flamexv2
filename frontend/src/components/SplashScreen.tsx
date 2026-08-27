import React, { useEffect, useRef, useState } from 'react';
import { Flame, ArrowRight, Radio, Satellite, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 450);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Stars generation
    const starsCount = Math.floor((width * height) / 3000);
    const stars: { x: number; y: number; size: number; alpha: number; speed: number; baseAlpha: number }[] = [];
    for (let i = 0; i < starsCount; i++) {
      const baseAlpha = Math.random() * 0.7 + 0.3;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.65), // Stars mostly in top space region
        size: Math.random() * 1.6 + 0.4,
        alpha: baseAlpha,
        baseAlpha: baseAlpha,
        speed: Math.random() * 0.02 + 0.005
      });
    }

    // Thermal Hotspots on Earth
    const hotspots: { x: number; y: number; size: number; phase: number; speed: number; color: string }[] = [];
    for (let i = 0; i < 45; i++) {
      hotspots.push({
        x: Math.random() * width,
        y: height * 0.72 + Math.random() * (height * 0.25),
        size: Math.random() * 3 + 2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.04 + 0.02,
        color: Math.random() > 0.3 ? '#FF5722' : '#FFD600'
      });
    }

    // City Light Clusters
    const cityClusters: { x: number; y: number; radius: number; color: string }[] = [];
    for (let i = 0; i < 35; i++) {
      cityClusters.push({
        x: Math.random() * width,
        y: height * 0.74 + Math.random() * (height * 0.22),
        radius: Math.random() * 25 + 10,
        color: 'rgba(255, 190, 80, 0.18)'
      });
    }

    let frameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Background Gradient
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
      spaceGrad.addColorStop(0, '#030712');
      spaceGrad.addColorStop(0.5, '#060D1F');
      spaceGrad.addColorStop(0.7, '#0A1835');
      spaceGrad.addColorStop(1, '#020617');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Stars with Twinkle
      stars.forEach((star) => {
        star.alpha = star.baseAlpha + Math.sin(t * star.speed * 50 + star.x) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, star.alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Earth Curve & Horizon Geometry
      const earthRadius = width * 1.35;
      const earthCenterX = width * 0.5;
      const earthCenterY = height * 0.72 + earthRadius;

      // 4. Atmosphere Outer Blue Glow Arc
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 22, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 160, 255, 0.35)';
      ctx.lineWidth = 32;
      ctx.filter = 'blur(16px)';
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 220, 255, 0.75)';
      ctx.lineWidth = 8;
      ctx.filter = 'blur(6px)';
      ctx.stroke();
      ctx.restore();

      // Sharp Horizon Rim Line
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.filter = 'blur(1px)';
      ctx.stroke();
      ctx.restore();

      // 5. Earth Dark Body (Masked)
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#060B14';
      ctx.fill();
      ctx.clip(); // Clip everything inside earth body

      // Earth Body Gradient Texture (Dark blue ocean + continent silhouette)
      const planetGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
      planetGrad.addColorStop(0, '#091224');
      planetGrad.addColorStop(0.3, '#070E1C');
      planetGrad.addColorStop(1, '#02050D');
      ctx.fillStyle = planetGrad;
      ctx.fillRect(0, height * 0.65, width, height * 0.35);

      // Render City Glow Ambient Blobs
      cityClusters.forEach((c) => {
        const radGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
        radGrad.addColorStop(0, 'rgba(255, 185, 70, 0.35)');
        radGrad.addColorStop(0.5, 'rgba(255, 140, 40, 0.15)');
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Pulsing Thermal / Fire Hotspots
      hotspots.forEach((h) => {
        const pulse = Math.sin(t * 3 + h.phase);
        const radius = Math.max(1, h.size + pulse * 1.5);
        const glowRadius = radius * 4.5;

        const glowGrad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, glowRadius);
        glowGrad.addColorStop(0, h.color);
        glowGrad.addColorStop(0.4, 'rgba(255, 87, 34, 0.5)');
        glowGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(h.x, h.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Hot White Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(h.x, h.y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore(); // Restore clipping

      frameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 15,
      y: (e.clientY / window.innerHeight - 0.5) * 15
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 w-screen h-screen bg-[#030712] flex flex-col items-center justify-between text-white select-none overflow-hidden transition-all duration-500 z-50 ${
        isEntering ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Starry Space & Earth Curve Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Status Bar (Telemetry Pills) */}
      <header className="relative z-10 w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 p-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/40" />
            </div>
          </div>
          <span className="text-sm font-black tracking-wider text-white">
            Flame<span className="text-orange-500">X</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md">
            <Satellite className="w-3.5 h-3.5 text-blue-400" />
            <span>NASA FIRMS VIIRS & MODIS</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Online</span>
          </div>
        </div>
      </header>

      {/* Central Content Area (Matches the User Reference Image) */}
      <main
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
        }}
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl transition-transform duration-200 ease-out my-auto"
      >
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans drop-shadow-2xl">
          AI-Powered{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
            Industrial Fire
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-orange-100">
            & Thermal Source Detection
          </span>
        </h1>

        {/* Glowing Horizon Divider Line */}
        <div className="w-48 sm:w-72 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-4 opacity-75 shadow-lg shadow-cyan-400/50" />

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-cyan-100/80 font-medium tracking-wide max-w-2xl drop-shadow-md">
          Real-time Monitoring Using NASA FIRMS & OSM Data
        </p>

        {/* Sleek "Enter Dashboard" CTA Button */}
        <div className="mt-8">
          <button
            onClick={handleEnter}
            className="group relative px-8 py-3.5 rounded-xl bg-[#0F172A]/85 hover:bg-[#1E293B] border border-cyan-400/50 hover:border-cyan-300 text-white font-bold text-sm tracking-wide shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-400/40 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md flex items-center gap-3 overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <span className="relative z-10">Enter Dashboard</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform relative z-10" />
          </button>

          <p className="text-[10px] text-gray-400 mt-2 font-mono opacity-60">
            Press <strong className="text-gray-200">Enter ↵</strong> or click to explore
          </p>
        </div>
      </main>

      {/* Footer Metrics Indicator */}
      <footer className="relative z-10 w-full px-8 py-6 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">●</span>
          <span>128 Active Hotspots Monitored</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span>Model: Hybrid-Classifier v1.0</span>
          <span>Latency: &lt; 2 min</span>
        </div>
      </footer>
    </div>
  );
};
