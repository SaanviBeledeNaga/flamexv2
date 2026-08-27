import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoJSONFeatureCollection, GeoJSONEventProperties, ClassificationClass } from '../types';
import { getClassConfig } from './ExplainabilityBadge';
import { Layers, Eye, Zap, Flame, Factory, MapPin, EyeOff } from 'lucide-react';

interface MapViewProps {
  eventsGeoJSON: GeoJSONFeatureCollection | null;
  facilitiesGeoJSON: GeoJSONFeatureCollection | null;
  selectedEventId: number | null;
  onSelectEvent: (eventId: number) => void;
}

// Custom Leaflet DivIcons with Confidence Outer Rings
const createCustomIcon = (classification: ClassificationClass, isSelected: boolean, severity: string, confidence: number) => {
  const cfg = getClassConfig(classification);
  const color = cfg.hex;
  const isHighRisk = severity === 'HIGH';
  const ringSize = Math.max(28, Math.round((confidence / 100) * 44));

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="${color}">
      <circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125 ${isSelected ? 'scale-125 z-50' : ''}">
        <!-- Outer Confidence Ring -->
        <div className="absolute rounded-full border-2 border-dashed pointer-events-none" style="width: ${ringSize}px; height: ${ringSize}px; border-color: ${color}; opacity: 0.6;"></div>
        ${isHighRisk ? `<div class="absolute -inset-3 rounded-full pulse-high-risk" style="background-color: ${color}; opacity: 0.35;"></div>` : ''}
        <div class="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center shadow-2xl relative z-10" style="background-color: #111827;">
          ${svgIcon}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

export const MapView: React.FC<MapViewProps> = ({
  eventsGeoJSON,
  facilitiesGeoJSON,
  selectedEventId,
  onSelectEvent
}) => {
  const [tileStyle, setTileStyle] = useState<'dark' | 'google_sat' | 'google_hybrid' | 'google_terrain'>('google_hybrid');
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const defaultCenter: [number, number] = [17.45, 78.52];
  const defaultZoom = 11;

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
    google_sat: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    google_hybrid: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    google_terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  };

  const handleOpenGoogleEarth3D = () => {
    const lat = 17.4502;
    const lon = 78.5201;
    const earthUrl = `https://earth.google.com/web/@${lat},${lon},300a,1000d,35y,0h,45t,0r`;
    window.open(earthUrl, '_blank');
  };

  return (
    <div className="relative w-full h-full bg-[#0B0F19]">
      {/* Map Control Bar (Layers & Styles) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-[#111827]/95 backdrop-blur-md border border-gray-800 p-2.5 rounded-xl shadow-2xl text-xs">
        {/* Style Switcher */}
        <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setTileStyle('dark')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              tileStyle === 'dark' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Dark Map
          </button>
          <button
            onClick={() => setTileStyle('google_sat')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              tileStyle === 'google_sat' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🌎 Google Earth Sat
          </button>
          <button
            onClick={() => setTileStyle('google_hybrid')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              tileStyle === 'google_hybrid' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🌎 Google Earth Hybrid
          </button>
          <button
            onClick={() => setTileStyle('google_terrain')}
            className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
              tileStyle === 'google_terrain' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ⛰️ Google Terrain
          </button>
        </div>

        {/* 3D Google Earth Button */}
        <button
          onClick={handleOpenGoogleEarth3D}
          className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
        >
          <span>🌎 Open Google Earth 3D Globe</span>
        </button>

        {/* Layer Checkboxes */}
        <div className="space-y-1.5 pt-1 text-gray-300">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Layers className="w-3 h-3 text-orange-500" />
            <span>Map Layers</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] hover:text-white">
            <input
              type="checkbox"
              checked={showAnomalies}
              onChange={(e) => setShowAnomalies(e.target.checked)}
              className="accent-orange-500 rounded"
            />
            <span>🔥 Thermal Anomalies</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] hover:text-white">
            <input
              type="checkbox"
              checked={showFacilities}
              onChange={(e) => setShowFacilities(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>🏭 Industrial Facilities</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] hover:text-white">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span>🌡️ Thermal Risk Heatmap</span>
          </label>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url={tileUrls[tileStyle]}
          attribution='&copy; CARTO &copy; Esri &copy; OpenStreetMap'
        />

        {/* Industrial Facilities Layer */}
        {showFacilities && facilitiesGeoJSON?.features.map((facFeat) => {
          const props = facFeat.properties;
          const geom = facFeat.geometry;

          if (geom.type === 'Polygon') {
            const coords = geom.coordinates[0].map((c: [number, number]) => [c[1], c[0]]);
            return (
              <Polygon
                key={`fac-poly-${props.id}`}
                positions={coords as any}
                pathOptions={{
                  color: '#F59E0B',
                  fillColor: '#F59E0B',
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '4,4'
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Factory className="w-4 h-4" />
                      <span>{props.name}</span>
                    </div>
                    <div className="text-gray-300 font-mono">Type: {props.facility_type}</div>
                    <div className="text-gray-400">Operator: {props.operator || 'N/A'}</div>
                  </div>
                </Popup>
              </Polygon>
            );
          } else {
            return (
              <CircleMarker
                key={`fac-pt-${props.id}`}
                center={[props.latitude, props.longitude]}
                radius={6}
                pathOptions={{ color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.6 }}
              />
            );
          }
        })}

        {/* Heatmap Layer Simulation Circles */}
        {showHeatmap && eventsGeoJSON?.features.map((feat) => {
          const [lon, lat] = feat.geometry.coordinates;
          const props = feat.properties as GeoJSONEventProperties;
          const radius = Math.max(300, props.risk_score * 12);
          return (
            <CircleMarker
              key={`heat-${props.id}`}
              center={[lat, lon]}
              radius={radius / 30}
              pathOptions={{
                color: props.severity === 'HIGH' ? '#EF4444' : '#F59E0B',
                fillColor: props.severity === 'HIGH' ? '#EF4444' : '#F59E0B',
                fillOpacity: 0.35,
                stroke: false
              }}
            />
          );
        })}

        {/* Thermal Event Anomaly Markers with Confidence Rings */}
        {showAnomalies && eventsGeoJSON?.features.map((feat) => {
          const props = feat.properties as GeoJSONEventProperties;
          const [lon, lat] = feat.geometry.coordinates;
          const isSelected = props.id === selectedEventId;
          const icon = createCustomIcon(props.classification, isSelected, props.severity, props.confidence);

          return (
            <Marker
              key={`evt-${props.id}`}
              position={[lat, lon]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEvent(props.id)
              }}
            >
              <Popup>
                <div className="p-3 space-y-2 text-xs w-64">
                  <div className="flex items-center justify-between border-b border-gray-700 pb-1.5">
                    <span className="font-mono font-bold text-white">Event #{props.external_id || props.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      props.severity === 'HIGH' ? 'bg-red-500/30 text-red-400 border border-red-500/40' : 'bg-amber-500/30 text-amber-400'
                    }`}>
                      Risk Score: {props.risk_score}/100
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-orange-400 capitalize flex items-center justify-between">
                      <span>{props.classification.replace('_', ' ')}</span>
                      <span className="text-gray-400 text-[10px] font-mono">{props.confidence}% conf</span>
                    </div>

                    <div className="text-gray-300 grid grid-cols-2 gap-1 font-mono text-[11px] bg-gray-900 p-2 rounded">
                      <div>Temp: <strong className="text-white">{props.brightness_temperature} K</strong></div>
                      <div>FRP: <strong className="text-white">{props.frp} MW</strong></div>
                    </div>

                    {props.nearest_facility && (
                      <div className="text-gray-300 text-[11px]">
                        Nearest: <span className="text-amber-300 font-medium">{props.nearest_facility}</span> ({props.distance_to_facility}m)
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectEvent(props.id)}
                    className="w-full mt-2 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded text-center transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect AI Diagnosis</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
