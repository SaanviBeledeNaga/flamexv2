import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Flame, ArrowRight, Satellite, RotateCw, Sparkles, Activity, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 500);
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

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Three.js Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020612);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.8, 12.0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls (Smooth dampening and auto-rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.8;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.65;
    controls.minDistance = 6.0;
    controls.maxDistance = 20.0;
    controls.maxPolarAngle = Math.PI * 0.85;

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a1628, 2.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 3.8);
    sunLight.position.set(15, 8, 12);
    scene.add(sunLight);

    const atmosphericLight = new THREE.DirectionalLight(0x0088ff, 2.5);
    atmosphericLight.position.set(-14, 6, -10);
    scene.add(atmosphericLight);

    // 5. Starfield & Cosmic Dust
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 70 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);

      const isTinted = Math.random() > 0.75;
      starColors[i] = isTinted ? 0.9 : 1.0;
      starColors[i + 1] = isTinted ? 0.95 : 1.0;
      starColors[i + 2] = isTinted ? 1.0 : 0.9;
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 6. High-Definition Procedural Earth Surface Canvas
    const earthRadius = 4.6;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Ocean Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, '#040d1f');
    oceanGrad.addColorStop(0.3, '#081a3d');
    oceanGrad.addColorStop(0.5, '#051433');
    oceanGrad.addColorStop(0.8, '#081a3d');
    oceanGrad.addColorStop(1, '#040d1f');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Continents & Landmasses
    ctx.fillStyle = '#1b4d2e';
    const landBlobs = [
      { x: 500, y: 340, r: 230 }, // North America
      { x: 640, y: 640, r: 180 }, // South America
      { x: 1040, y: 360, r: 200 }, // Europe
      { x: 1080, y: 540, r: 240 }, // Africa
      { x: 1440, y: 330, r: 300 }, // Asia / Eurasia
      { x: 1370, y: 460, r: 110 }, // India
      { x: 1640, y: 700, r: 150 }  // Australia
    ];

    landBlobs.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();

      // Topography details & terrain variation
      for (let j = 0; j < 14; j++) {
        ctx.fillStyle = j % 2 === 0 ? '#266138' : '#7d6136';
        ctx.beginPath();
        ctx.arc(
          c.x + (Math.random() - 0.5) * c.r * 1.35,
          c.y + (Math.random() - 0.5) * c.r * 1.35,
          c.r * (Math.random() * 0.4 + 0.2),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // Night City Light Grids & Settlements
    for (let i = 0; i < 450; i++) {
      const cx = 300 + Math.random() * 1500;
      const cy = 200 + Math.random() * 600;
      ctx.fillStyle = Math.random() > 0.35 ? 'rgba(255, 210, 90, 0.9)' : 'rgba(255, 95, 30, 0.95)';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.random() * 2.2 + 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.2
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 7. Luminous Blue Atmospheric Glow Shell (Fresnel Shader)
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

    // 8. Glowing Orbiting Satellite Trails & Data Lines
    const orbitsGroup = new THREE.Group();

    // Helper to build 3D orbital rings
    const createOrbitLine = (radiusX: number, radiusY: number, tiltX: number, tiltY: number, colorHex: number) => {
      const points: THREE.Vector3[] = [];
      const segments = 120;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radiusX, 0, Math.sin(theta) * radiusY));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geo, mat);
      line.rotation.x = tiltX;
      line.rotation.y = tiltY;
      return line;
    };

    const orbit1 = createOrbitLine(6.2, 5.8, 0.5, 0.4, 0x00d2ff); // VIIRS orbit
    const orbit2 = createOrbitLine(6.8, 6.4, -0.4, -0.6, 0x3b82f6); // Sentinel-2 orbit
    const orbit3 = createOrbitLine(7.4, 7.0, 0.8, -0.3, 0xff7700); // MODIS orbit
    orbitsGroup.add(orbit1, orbit2, orbit3);

    // Satellite Mesh Nodes on Orbit Tracks
    const createSatellite = (colorHex: number) => {
      const satGroup = new THREE.Group();
      // Satellite body
      const bodyGeo = new THREE.BoxGeometry(0.12, 0.12, 0.16);
      const bodyMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      satGroup.add(body);

      // Solar panels
      const panelGeo = new THREE.BoxGeometry(0.4, 0.02, 0.1);
      const panelMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      satGroup.add(panel);

      // Glow halo
      const glowGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      satGroup.add(new THREE.Mesh(glowGeo, glowMat));

      return satGroup;
    };

    const sat1 = createSatellite(0x00d2ff); // VIIRS
    const sat2 = createSatellite(0x3b82f6); // Sentinel-2
    const sat3 = createSatellite(0xff7700); // MODIS
    orbitsGroup.add(sat1, sat2, sat3);
    scene.add(orbitsGroup);

    // 9. 3D Pulsing Thermal Fire Spikes on Globe
    const fireGroup = new THREE.Group();
    const thermalHotspots = [
      { lat: 17.45, lon: 78.52, size: 382 }, // XYZ Petrochemical
      { lat: 19.07, lon: 72.87, size: 210 }, // Mumbai Refinery
      { lat: 21.17, lon: 72.83, size: 160 }, // Surat Flaring
      { lat: 13.08, lon: 80.27, size: 240 }, // Chennai
      { lat: 28.61, lon: 77.20, size: 310 }, // Northern Thermal Hub
      { lat: 22.57, lon: 88.36, size: 280 }  // Eastern Smelter
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

    thermalHotspots.forEach((pt) => {
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

      // Heat Core Glow Sphere
      const glowGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd000 });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.copy(pos.clone().multiplyScalar(1.01));
      fireGroup.add(glowMesh);
    });

    earthMesh.add(fireGroup);

    // 10. Animation Loop with Parallax
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      controls.update();

      // Earth Axial Spin
      if (isRotating) {
        earthMesh.rotation.y += delta * 0.08;
      }

      // Orbit Satellites Along Trajectories
      const t1 = time * 0.45;
      sat1.position.set(Math.cos(t1) * 6.2, Math.sin(t1 * 0.8) * 0.8, Math.sin(t1) * 5.8);
      sat1.rotation.y += 0.02;

      const t2 = time * 0.35 + 2.0;
      sat2.position.set(Math.cos(t2) * 6.8, Math.sin(t2 * 0.6) * -1.2, Math.sin(t2) * 6.4);
      sat2.rotation.y += 0.015;

      const t3 = time * 0.5 + 4.0;
      sat3.position.set(Math.cos(t3) * 7.4, Math.sin(t3) * 1.5, Math.sin(t3) * 7.0);
      sat3.rotation.y += 0.025;

      // Starfield subtle slow rotation
      starField.rotation.y -= delta * 0.01;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
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
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 w-screen h-screen bg-[#020612] text-white select-none overflow-hidden transition-all duration-500 z-50 ${
        isEntering ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 3D WebGL Earth Mount Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Telemetry Header */}
      <header className="relative z-20 w-full px-8 py-6 flex items-center justify-between pointer-events-none">
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

        <div className="hidden sm:flex items-center gap-3 pointer-events-auto">
          <div className="px-3.5 py-1 rounded-full bg-[#0B132B]/85 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2 backdrop-blur-md shadow-lg">
            <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>NASA FIRMS VIIRS & MODIS Online</span>
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-1.5 rounded-full bg-[#0B132B]/85 border border-gray-700 text-gray-300 hover:text-white transition"
            title={isRotating ? 'Pause Earth Rotation' : 'Resume Earth Rotation'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'text-orange-400' : 'text-gray-500'}`} />
          </button>
        </div>
      </header>

      {/* Central Content Area with Subtle Parallax Shift */}
      <main
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`
        }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto z-20 pointer-events-none transition-transform duration-300 ease-out"
      >
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans drop-shadow-[0_10px_35px_rgba(0,0,0,0.95)]">
          AI-Powered{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-200">
            Industrial Fire
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-orange-100">
            & Thermal Source Detection
          </span>
        </h1>

        {/* Glowing Horizon Accent Divider Line */}
        <div className="w-56 sm:w-80 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-4 shadow-lg shadow-cyan-400/60" />

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-cyan-100/90 font-medium tracking-wide max-w-2xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] font-sans">
          Real-time Monitoring Using NASA FIRMS & OSM Data
        </p>

        {/* Interactive "Enter Dashboard" CTA Button */}
        <div className="mt-8 pointer-events-auto">
          <button
            onClick={handleEnter}
            className="group relative px-9 py-3.5 rounded-xl bg-[#0B132B]/90 hover:bg-[#121E3F] border border-cyan-400/60 hover:border-cyan-300 text-white font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(0,180,255,0.35)] hover:shadow-[0_0_40px_rgba(0,210,255,0.55)] transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md flex items-center gap-3 overflow-hidden"
          >
            {/* Shimmer Sweep Animation */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <span className="relative z-10 font-sans">Enter Dashboard</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform relative z-10" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 mt-2.5 font-mono">
            <span>Drag Earth to rotate 360°</span>
            <span>•</span>
            <span>Press <strong className="text-gray-200">Enter ↵</strong></span>
          </div>
        </div>
      </main>

      {/* Bottom Telemetry & Status Indicator */}
      <footer className="relative z-20 w-full px-8 py-5 flex items-center justify-between text-xs text-gray-400 font-mono pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>128 Active Hotspots Monitored</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span>Satellite Orbits: VIIRS • Sentinel-2 • MODIS</span>
          <span>Model: Hybrid v1.0</span>
        </div>
      </footer>
    </div>
  );
};
