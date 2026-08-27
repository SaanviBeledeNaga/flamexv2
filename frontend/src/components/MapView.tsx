import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoJSONFeatureCollection, GeoJSONEventProperties, ClassificationClass } from '../types';
import { Plus, Minus, Crosshair, Layers, Droplets, Flame, Factory, Trees, Wheat, HardHat, HelpCircle, ChevronDown } from 'lucide-react';

interface MapViewProps {
  eventsGeoJSON: GeoJSONFeatureCollection | null;
  facilitiesGeoJSON: GeoJSONFeatureCollection | null;
  selectedEventId: number | null;
  onSelectEvent: (eventId: number) => void;
  totalEventsCount?: number;
}

// Map Zoom Controller component
const MapControls: React.FC = () => {
  const map = useMap();
  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1.5 bg-[#101623]/95 backdrop-blur-md border border-[#1E2738] p-1 rounded-xl shadow-2xl">
      <button
        onClick={() => map.zoomIn()}
        className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="h-px bg-gray-800 my-0.5" />
      <button
        onClick={() => map.setView([17.45, 78.52], 6)}
        className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition"
        title="Center India Region"
      >
        <Crosshair className="w-3.5 h-3.5" />
      </button>
      <button
        className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition"
        title="Map Layers"
      >
        <Layers className="w-3.5 h-3.5" />
      </button>
      <button
        className="w-7 h-7 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition"
        title="Atmospheric / Moisture"
      >
        <Droplets className="w-3.5 h-3.5 text-blue-400" />
      </button>
    </div>
  );
};

// Custom Marker Creator with Glowing Pulsing Circles & Emojis
const createMarkerIcon = (classification: ClassificationClass, isSelected: boolean, isHighRisk: boolean) => {
  const getSymbol = (c: ClassificationClass) => {
    switch (c) {
      case 'industrial_fire': return { emoji: '🔥', bg: '#EF4444' };
      case 'gas_flare': return { emoji: '🟠', bg: '#F97316' };
      case 'forest_fire': return { emoji: '🌲', bg: '#EAB308' };
      case 'agricultural_burn': return { emoji: '🌾', bg: '#22C55E' };
      case 'mining_activity': return { emoji: '⛏️', bg: '#A855F7' };
      default: return { emoji: '❓', bg: '#6B7280' };
    }
  };

  const { emoji, bg } = getSymbol(classification);

  return L.divIcon({
    className: 'flamex-pin-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125 ${isSelected ? 'scale-125 z-50' : ''}">
        ${isHighRisk ? `<div class="absolute -inset-2 rounded-full animate-ping" style="background-color: ${bg}; opacity: 0.35;"></div>` : ''}
        <div class="w-7 h-7 rounded-full border-2 border-gray-900 flex items-center justify-center shadow-2xl relative z-10 text-xs" style="background-color: #111827;">
          <span>${emoji}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Cluster Hotspot Circle Icon
const createClusterIcon = (count: number) => {
  return L.divIcon({
    className: 'flamex-cluster-marker',
    html: `
      <div class="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer relative" style="background: radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(249,115,22,0.15) 70%, transparent 100%);">
        <div class="w-8 h-8 rounded-full bg-[#FF6B00] border-2 border-orange-300 flex items-center justify-center shadow-lg shadow-orange-600/40 text-white font-bold font-mono text-xs">
          ${count}
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28]
  });
};

export const MapView: React.FC<MapViewProps> = ({
  eventsGeoJSON,
  facilitiesGeoJSON,
  selectedEventId,
  onSelectEvent,
  totalEventsCount = 128
}) => {
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'terrain'>('dark');
  const [layers, setLayers] = useState({
    thermal: true,
    facilities: true,
    landcover: true,
    forest: true,
    agriculture: true,
    mining: true,
    population: false,
    roads: false,
    satellite: false
  });

  // India Center coordinates
  const defaultCenter: [number, number] = [17.8, 78.8];
  const defaultZoom = 6;

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
    satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  };

  const clusters = [
    { pos: [19.7515, 75.7139] as [number, number], count: 12, label: 'Maharashtra' },
    { pos: [17.8496, 79.1152] as [number, number], count: 7, label: 'Telangana' },
    { pos: [15.3173, 75.7139] as [number, number], count: 6, label: 'Karnataka' },
    { pos: [15.9129, 79.7400] as [number, number], count: 5, label: 'Andhra Pradesh' }
  ];

  return (
    <div className="relative w-full h-full bg-[#0B0F17] select-none">
      {/* 128 Events Badge Top-Left of Map */}
      <div className="absolute top-4 left-16 z-[1000] px-3 py-1.5 rounded-xl bg-[#101623]/95 backdrop-blur-md border border-[#1E2738] text-white font-mono font-bold text-xs shadow-2xl flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span>{totalEventsCount} Events</span>
      </div>

      {/* Floating Map Layers / Style / Legend Card on Right */}
      <div className="absolute top-4 right-4 z-[1000] w-64 bg-[#101623]/95 backdrop-blur-md border border-[#1E2738] rounded-2xl shadow-2xl p-3.5 text-xs text-gray-300 space-y-3 max-h-[90%] overflow-y-auto hidden sm:block">
        {/* Layer Checkboxes */}
        <div className="space-y-1.5">
          <div className="font-bold text-white text-xs flex items-center justify-between">
            <span>Map Layers</span>
            <span className="text-[10px] text-gray-500 font-mono">Active (6)</span>
          </div>

          <div className="space-y-1 text-[11px] pt-1 font-medium">
            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.thermal}
                onChange={(e) => setLayers({ ...layers, thermal: e.target.checked })}
                className="accent-red-500 rounded"
              />
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Thermal Anomalies</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.facilities}
                onChange={(e) => setLayers({ ...layers, facilities: e.target.checked })}
                className="accent-purple-500 rounded"
              />
              <span>🏭 Industrial Facilities</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.landcover}
                onChange={(e) => setLayers({ ...layers, landcover: e.target.checked })}
                className="accent-blue-500 rounded"
              />
              <span>🟩 Land Cover</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.forest}
                onChange={(e) => setLayers({ ...layers, forest: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
              <span>🌲 Forest</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.agriculture}
                onChange={(e) => setLayers({ ...layers, agriculture: e.target.checked })}
                className="accent-green-500 rounded"
              />
              <span>🌾 Agriculture</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layers.mining}
                onChange={(e) => setLayers({ ...layers, mining: e.target.checked })}
                className="accent-purple-500 rounded"
              />
              <span>⛏️ Mining Areas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white opacity-60">
              <input
                type="checkbox"
                checked={layers.population}
                onChange={(e) => setLayers({ ...layers, population: e.target.checked })}
                className="accent-gray-500 rounded"
              />
              <span>👥 Population Density</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white opacity-60">
              <input
                type="checkbox"
                checked={layers.roads}
                onChange={(e) => setLayers({ ...layers, roads: e.target.checked })}
                className="accent-gray-500 rounded"
              />
              <span>🛣️ Roads</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white opacity-60">
              <input
                type="checkbox"
                checked={layers.satellite}
                onChange={(e) => setLayers({ ...layers, satellite: e.target.checked })}
                className="accent-gray-500 rounded"
              />
              <span>🛰️ Satellite Imagery</span>
            </label>
          </div>
        </div>

        {/* Map Style 3-way toggle */}
        <div className="space-y-1.5 pt-1 border-t border-[#1E2738]">
          <div className="font-bold text-white text-xs">Map Style</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['dark', 'satellite', 'terrain'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold capitalize transition border ${
                  mapStyle === style
                    ? 'bg-[#FF5722] text-white border-orange-500 shadow-md shadow-orange-600/20'
                    : 'bg-[#161D2C] border-[#26334A] text-gray-400 hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1 pt-1 border-t border-[#1E2738] text-[10px]">
          <div className="flex items-center justify-between text-gray-400 font-bold uppercase tracking-wider text-[9px] pb-0.5">
            <span>Classification</span>
            <span>Count</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-1.5">🔴 Industrial Fire</span>
            <span className="font-mono text-gray-400">14</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-1.5">🟠 Persistent Source</span>
            <span className="font-mono text-gray-400">27</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-1.5">🟡 Wildfire</span>
            <span className="font-mono text-gray-400">31</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-1.5">🟢 Agricultural Burn</span>
            <span className="font-mono text-gray-400">16</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-1.5">🟣 Mining Activity</span>
            <span className="font-mono text-gray-400">9</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center gap-1.5">⚪ Unknown</span>
            <span className="font-mono text-gray-400">31</span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapControls />

        <TileLayer
          url={tileUrls[mapStyle]}
          attribution='&copy; CARTO &copy; Google &copy; OpenStreetMap'
        />

        {/* Hotspot Cluster Circles */}
        {clusters.map((c, i) => (
          <Marker
            key={`cluster-${i}`}
            position={c.pos}
            icon={createClusterIcon(c.count)}
          />
        ))}

        {/* Industrial Facilities Layer Polygons */}
        {layers.facilities && facilitiesGeoJSON?.features.map((facFeat) => {
          const props = facFeat.properties;
          const geom = facFeat.geometry;

          if (geom.type === 'Polygon') {
            const coords = geom.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]]);
            return (
              <Polygon
                key={`fac-poly-${props.id}`}
                positions={coords as any}
                pathOptions={{
                  color: '#F59E0B',
                  fillColor: '#F59E0B',
                  fillOpacity: 0.2,
                  weight: 1.5,
                  dashArray: '3,3'
                }}
              />
            );
          }
          return null;
        })}

        {/* Thermal Event Anomaly Markers */}
        {layers.thermal && eventsGeoJSON?.features.map((feat) => {
          const props = feat.properties as GeoJSONEventProperties;
          const [lon, lat] = feat.geometry.coordinates;
          const isSelected = props.id === selectedEventId;
          const isHighRisk = props.severity === 'HIGH';
          const icon = createMarkerIcon(props.classification, isSelected, isHighRisk);

          return (
            <Marker
              key={`evt-${props.id}`}
              position={[lat, lon]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEvent(props.id)
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};
