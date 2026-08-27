import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GeoJSONFeatureCollection, GeoJSONEventProperties } from '../types';
import { Globe, RotateCw, ZoomIn, ZoomOut, Compass, Flame, Factory, X, Layers } from 'lucide-react';
import { getClassConfig } from './ExplainabilityBadge';

interface Globe3DViewProps {
  eventsGeoJSON: GeoJSONFeatureCollection | null;
  facilitiesGeoJSON: GeoJSONFeatureCollection | null;
  selectedEventId: number | null;
  onSelectEvent: (eventId: number) => void;
  onClose?: () => void;
}

export const Globe3DView: React.FC<Globe3DViewProps> = ({
  eventsGeoJSON,
  facilitiesGeoJSON,
  selectedEventId,
  onSelectEvent,
  onClose
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 14);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (360° mouse drag, rotate, zoom, tilt)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 0.6;
    controls.minDistance = 7;
    controls.maxDistance = 25;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffa500, 2.0);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 6. 3D Earth Globe Sphere
    const earthRadius = 5;
    const globeGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    // Load NASA Blue Marble Satellite Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthSatTexture = textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      () => renderer.render(scene, camera)
    );
    earthSatTexture.colorSpace = THREE.SRGBColorSpace;

    const globeMaterial = new THREE.MeshStandardMaterial({
      map: earthSatTexture,
      roughness: 0.6,
      metalness: 0.1
    });

    const earthMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(earthMesh);

    // Atmosphere Outer Glow
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // Starfield Background Particles
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1000;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Convert Latitude & Longitude to 3D Cartesian Vector3
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      return new THREE.Vector3(x, y, z);
    };

    // 7. Render 3D Industrial Facilities (Amber Beacons)
    const facilityGroup = new THREE.Group();
    scene.add(facilityGroup);

    if (facilitiesGeoJSON) {
      facilitiesGeoJSON.features.forEach((fac) => {
        const [lon, lat] = fac.geometry.type === 'Point' 
          ? fac.geometry.coordinates 
          : [fac.properties.longitude, fac.properties.latitude];

        const pos = latLonToVector3(lat, lon, earthRadius + 0.05);

        const facGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16);
        const facMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const facMesh = new THREE.Mesh(facGeom, facMat);

        facMesh.position.copy(pos);
        facMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
        facilityGroup.add(facMesh);
      });
    }

    // 8. Render 3D Thermal Anomaly Pins (Glowing Flame Beacons)
    const eventGroup = new THREE.Group();
    scene.add(eventGroup);
    const eventMeshes: { mesh: THREE.Mesh; eventId: number; title: string }[] = [];

    if (eventsGeoJSON) {
      eventsGeoJSON.features.forEach((feat) => {
        const props = feat.properties as GeoJSONEventProperties;
        const [lon, lat] = feat.geometry.coordinates;

        const pos = latLonToVector3(lat, lon, earthRadius + 0.08);
        const cfg = getClassConfig(props.classification);
        const isSelected = props.id === selectedEventId;

        // 3D Pulsing Flame Pin Cone
        const pinGeom = new THREE.ConeGeometry(isSelected ? 0.15 : 0.1, isSelected ? 0.5 : 0.3, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(cfg.hex) });
        const pinMesh = new THREE.Mesh(pinGeom, pinMat);

        pinMesh.position.copy(pos);
        pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

        eventGroup.add(pinMesh);
        eventMeshes.push({
          mesh: pinMesh,
          eventId: props.id,
          title: `Event #${props.external_id || props.id} (${props.classification.replace('_', ' ')})`
        });
      });
    }

    // Raycaster for Hover & Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(eventMeshes.map(m => m.mesh));

      if (intersects.length > 0) {
        const matched = eventMeshes.find(m => m.mesh === intersects[0].object);
        if (matched) {
          setHoveredInfo(matched.title);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredInfo(null);
      container.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(eventMeshes.map(m => m.mesh));

      if (intersects.length > 0) {
        const matched = eventMeshes.find(m => m.mesh === intersects[0].object);
        if (matched) {
          onSelectEvent(matched.eventId);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [eventsGeoJSON, facilitiesGeoJSON, selectedEventId, isAutoRotating]);

  return (
    <div className="relative w-full h-full bg-[#0B0F19] overflow-hidden flex flex-col justify-between">
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-[#111827]/90 backdrop-blur border border-gray-800 px-4 py-2.5 rounded-xl shadow-2xl">
        <Globe className="w-6 h-6 text-orange-500 animate-pulse" />
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>FlameX 3D Satellite Earth Globe</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 font-mono border border-orange-500/30">
              Three.js WebGL Engine
            </span>
          </h3>
          <p className="text-[11px] text-gray-400 font-mono">
            Interactive 360° Drag, Pitch & Thermal Anomaly Placemarks
          </p>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Hover Info Tooltip */}
      {hoveredInfo && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-orange-500 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-2xl animate-bounce border border-orange-400">
          🔥 Click to Inspect {hoveredInfo}
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-[#111827]/90 backdrop-blur border border-gray-800 p-2 rounded-xl shadow-2xl text-xs">
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
            isAutoRotating ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
          <span>{isAutoRotating ? '360° Auto-Rotate ON' : 'Start 360° Auto-Rotate'}</span>
        </button>
      </div>

      {/* Three.js Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
