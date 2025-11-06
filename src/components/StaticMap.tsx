// @/components/Map.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerPNG from '@/assets/images/marker.png';

// ✅ Define ONCE, outside component — critical!
const CustomMarkerIcon = new L.Icon({
  iconUrl: MarkerPNG,
  iconSize: [40, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

interface SimpleMapProps {
  center: [number, number];
}

export default function SimpleMap({ center }: SimpleMapProps) {
  // Guard against invalid coords
  if (!center || !center.length || typeof center[0] !== 'number' || typeof center[1] !== 'number') {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>مختصات نامعتبر</div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      dragging={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        key="google-street"
        url="https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}&hl=fa"
        maxZoom={20}
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
        attribution='&copy; Google'
      />
      <Marker position={center} icon={CustomMarkerIcon} />
    </MapContainer>
  );
}