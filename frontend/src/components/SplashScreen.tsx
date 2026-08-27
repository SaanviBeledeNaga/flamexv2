import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Flame, ArrowRight, Satellite, RotateCw, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [isRotating, setIsRotating] = useState(true);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 450);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020612);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position camera to view the Earth horizon curve nicely
    camera.position.set(0, 3.2, 11.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls (Interactive dragging & rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.75;
    controls.minDistance = 6.5;
    controls.maxDistance = 22;
    controls.maxPolarAngle = Math.PI * 0.85;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0x0b1a30, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.5);
    sunLight.position.set(12, 6, 10);
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x00a2ff, 2.8);
    blueRimLight.position.set(-12, 8, -8);
    scene.add(blueRimLight);

    // 5. Starfield Generation
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 80 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPos[i] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i + 2] = r * Math.cos(phi);

      const isWarm = Math.random() > 0.8;
      starColors[i] = isWarm ? 1.0 : 0.8;
      starColors[i + 1] = isWarm ? 0.9 : 0.9;
      starColors[i + 2] = 1.0;
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // 6. High-Definition Procedural Earth Surface Canvas Texture
    const earthRadius = 4.6;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Oceans gradient base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#06132b');
    oceanGrad.addColorStop(0.3, '#0b2046');
    oceanGrad.addColorStop(0.5, '#071836');
    oceanGrad.addColorStop(0.8, '#0b2046');
    oceanGrad.addColorStop(1, '#06132b');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Landmasses procedural silhouettes
    ctx.fillStyle = '#1c4a2a'; // Deep green/forest
    const continents = [
      { x: 500, y: 350, r: 240 }, // North America
      { x: 650, y: 650, r: 190 }, // South America
      { x: 1050, y: 380, r: 210 }, // Europe
      { x: 1100, y: 550, r: 250 }, // Africa
      { x: 1450, y: 340, r: 310 }, // Asia / India / Siberia
      { x: 1380, y: 460, r: 110 }, // India subcontinent
      { x: 1650, y: 700, r: 160 }  // Australia
    ];

    continents.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();

      // Land textures & topography ridges
      for (let j = 0; j < 12; j++) {
        ctx.fillStyle = j % 2 === 0 ? '#266138' : '#8c6f3d';
        ctx.beginPath();
        ctx.arc(
          c.x + (Math.random() - 0.5) * c.r * 1.4,
          c.y + (Math.random() - 0.5) * c.r * 1.4,
          c.r * (Math.random() * 0.4 + 0.2),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // Night City Lights & Thermal Hotspots (Golden / Orange Sparks)
    for (let i = 0; i < 400; i++) {
      const cx = 300 + Math.random() * 1500;
      const cy = 200 + Math.random() * 600;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 205, 80, 0.85)' : 'rgba(255, 90, 30, 0.95)';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.random() * 2.5 + 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Earth Sphere Geometry
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.15
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 7. Luminous Blue Atmosphere Glow Shell (Fresnel Inverted Shader)
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.045, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.0, 0.75, 1.0, 1.0) * intensity * 1.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 8. 3D Pulsing Thermal Fire Spikes & Beams
    const fireGroup = new THREE.Group();
    const thermalPoints = [
      { lat: 17.45, lon: 78.52, label: 'XYZ Petrochemical Fire', size: 382 },
      { lat: 19.07, lon: 72.87, label: 'Mumbai Industrial Area', size: 210 },
      { lat: 21.17, lon: 72.83, label: 'Surat Petrochemical Flare', size: 160 },
      { lat: 13.08, lon: 80.27, label: 'Chennai Refinery Anomaly', size: 240 },
      { lat: 12.97, lon: 77.59, label: 'Bengaluru Zone', size: 95 },
      { lat: 28.61, lon: 77.20, label: 'Northern Power Complex', size: 310 },
      { lat: 22.57, lon: 88.36, label: 'Eastern Smelter Hub', size: 280 }
    ];

    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    thermalPoints.forEach((pt) => {
      const pos = latLonToVector3(pt.lat, pt.lon, earthRadius);

      // Glowing Fire Spike Cylinder
      const height = 0.4 + (pt.size / 400) * 0.5;
      const spikeGeo = new THREE.CylinderGeometry(0.02, 0.08, height, 8);
      spikeGeo.translate(0, height / 2, 0);
      spikeGeo.rotateX(Math.PI / 2);

      const spikeMat = new THREE.MeshBasicMaterial({
        color: 0xff3b00,
        transparent: true,
        opacity: 0.95
      });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.copy(pos);
      spike.lookAt(new THREE.Vector3(0, 0, 0));
      spike.rotateY(Math.PI);
      fireGroup.add(spike);

      // Heat Core Sphere
      const glowGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffd000
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(pos.clone().multiplyScalar(1.01));
      fireGroup.add(glowMesh);
    });

    earthMesh.add(fireGroup);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      controls.update();

      // Earth slow realistic axial rotation
      if (isRotating) {
        earthMesh.rotation.y += delta * 0.08;
      }

      // Starfield subtle shimmer
      stars.rotation.y -= delta * 0.01;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // 10. Window Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isRotating]);

  return (
    <div className={`fixed inset-0 w-screen h-screen bg-[#020612] text-white select-none overflow-hidden transition-all duration-500 z-50 ${
      isEntering ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
    }`}>
      {/* 3D Moving Earth Three.js Mount Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Telemetry Header */}
      <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#020612] rounded-[10px] flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/40" />
            </div>
          </div>
          <span className="text-base font-black tracking-tight text-white">
            Flame<span className="text-orange-500">X</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 pointer-events-auto">
          <div className="px-3.5 py-1 rounded-full bg-[#0B132B]/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2 backdrop-blur-md shadow-lg">
            <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>NASA FIRMS VIIRS/MODIS Telemetry</span>
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-1.5 rounded-full bg-[#0B132B]/80 border border-gray-700 text-gray-300 hover:text-white transition"
            title={isRotating ? 'Pause Earth Rotation' : 'Resume Earth Rotation'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'text-orange-400' : 'text-gray-500'}`} />
          </button>
        </div>
      </header>

      {/* Center Cinematic Overlay (Matching the User Reference Image) */}
      <main className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto z-20 pointer-events-none">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
          AI-Powered{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-200">
            Industrial Fire
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-orange-100">
            & Thermal Source Detection
          </span>
        </h1>

        {/* Luminous Horizon Accent Line */}
        <div className="w-56 sm:w-80 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-4 shadow-lg shadow-cyan-400/60" />

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-cyan-100/90 font-medium tracking-wide max-w-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          Real-time Monitoring Using NASA FIRMS & OSM Data
        </p>

        {/* Interactive "Enter Dashboard" CTA Button */}
        <div className="mt-8 pointer-events-auto">
          <button
            onClick={handleEnter}
            className="group relative px-9 py-3.5 rounded-xl bg-[#0B132B]/90 hover:bg-[#121E3F] border border-cyan-400/60 hover:border-cyan-300 text-white font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(0,180,255,0.35)] hover:shadow-[0_0_40px_rgba(0,210,255,0.55)] transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md flex items-center gap-3 overflow-hidden"
          >
            {/* Ambient Shimmer Beam */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <span className="relative z-10">Enter Dashboard</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform relative z-10" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 mt-2.5 font-mono">
            <span>Drag Earth to rotate 360°</span>
            <span>•</span>
            <span>Press <strong className="text-gray-200">Enter ↵</strong></span>
          </div>
        </div>
      </main>

      {/* Bottom Live Metrics Bar */}
      <footer className="relative z-20 w-full px-8 py-5 flex items-center justify-between text-xs text-gray-400 font-mono pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>128 Active Hotspots Monitored</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span>WebGL 3D Earth Engine Active</span>
          <span>Model: Hybrid v1.0</span>
        </div>
      </footer>
    </div>
  );
};
