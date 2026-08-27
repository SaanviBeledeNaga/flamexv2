import React, { useEffect, useState } from 'react';
import { Flame, ArrowRight, Satellite, ShieldCheck, Radio } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isEntering, setIsEntering] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Smooth fade-in on mount
    const timer = setTimeout(() => setIsLoaded(true), 80);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Subtle, faint parallax offset (stars shift slightly, Earth remains grounded)
    const x = (e.clientX / window.innerWidth - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;
    setMouseOffset({ x, y });
  };

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 450);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 w-screen h-screen bg-[#020612] text-white select-none overflow-hidden transition-all duration-500 z-50 flex flex-col justify-between ${
        isEntering ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 1. BACKGROUND: HD Static Cinematic Earth from Space at Night */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Deep starry space base layer */}
        <div
          style={{
            transform: `translate3d(${mouseOffset.x * 0.5}px, ${mouseOffset.y * 0.5}px, 0)`
          }}
          className="absolute -inset-8 bg-[#020612] transition-transform duration-700 ease-out"
        />

        {/* High-Definition Static Earth Image */}
        <img
          src="/assets/earth_night_hd.jpg"
          alt="Earth from space at night with city lights"
          className={`w-full h-full object-cover object-bottom transition-all duration-1000 ease-out ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-102'
          }`}
          style={{
            transform: `translate3d(${mouseOffset.x * 0.2}px, ${mouseOffset.y * 0.2}px, 0)`
          }}
        />

        {/* Atmosphere Soft Horizon Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#020612]/30 to-[#020612]/80 pointer-events-none" />

        {/* Subtle Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,18,0.75)_100%)] pointer-events-none" />
      </div>

      {/* 2. TOP TELEMETRY BAR */}
      <header
        className={`relative z-20 w-full px-6 sm:px-10 py-6 flex items-center justify-between pointer-events-none transition-all duration-700 delay-100 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#020612] rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/40" />
            </div>
          </div>
          <span className="text-base font-black tracking-tight text-white font-sans">
            Flame<span className="text-orange-500">X</span>
          </span>
        </div>

        {/* Live Satellite Indicators */}
        <div className="hidden sm:flex items-center gap-3 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-full bg-[#0B132B]/85 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2 backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>NASA FIRMS VIIRS & MODIS</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#0B132B]/85 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Online</span>
          </div>
        </div>
      </header>

      {/* 3. CENTER HERO CONTENT */}
      <main
        style={{
          transform: `translate3d(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px, 0)`
        }}
        className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto my-auto transition-transform duration-300 ease-out"
      >
        {/* Title with smooth fade-in */}
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans drop-shadow-[0_12px_40px_rgba(0,0,0,0.95)] transition-all duration-700 delay-150 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          AI-Powered{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-200">
            Industrial Fire
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-orange-100">
            & Thermal Source Detection
          </span>
        </h1>

        {/* Luminous Horizon Accent Divider */}
        <div
          className={`w-56 sm:w-80 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-4 shadow-lg shadow-cyan-400/60 transition-all duration-700 delay-300 ${
            isLoaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        />

        {/* Subtitle */}
        <p
          className={`text-xs sm:text-sm md:text-base text-cyan-100/90 font-medium tracking-wide max-w-2xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-sans transition-all duration-700 delay-350 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Real-time Monitoring Using NASA FIRMS & OSM Data
        </p>

        {/* 4. "ENTER DASHBOARD" CTA BUTTON */}
        <div
          className={`mt-8 pointer-events-auto transition-all duration-700 delay-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <button
            onClick={handleEnter}
            className="group relative px-9 py-3.5 rounded-xl bg-[#0B132B]/90 hover:bg-[#121E3F] border border-cyan-400/60 hover:border-cyan-300 text-white font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(0,180,255,0.35)] hover:shadow-[0_0_45px_rgba(0,210,255,0.65)] transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md flex items-center gap-3 overflow-hidden cursor-pointer"
          >
            {/* Shimmer Ambient Light Sweep on Hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <span className="relative z-10 font-sans">Enter Dashboard</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform relative z-10" />
          </button>

          <p className="text-[10px] text-gray-400 mt-2.5 font-mono opacity-70">
            Press <strong className="text-gray-200">Enter ↵</strong> or click to explore
          </p>
        </div>
      </main>

      {/* 5. FOOTER TELEMETRY & LIVE HOTSPOT COUNTERS */}
      <footer
        className={`relative z-20 w-full px-6 sm:px-10 py-5 flex items-center justify-between text-xs text-gray-400 font-mono pointer-events-none transition-all duration-700 delay-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>128 Active Hotspots Monitored</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span>Static HD Space Imagery</span>
          <span>•</span>
          <span>Model: Hybrid v1.0</span>
        </div>
      </footer>
    </div>
  );
};
