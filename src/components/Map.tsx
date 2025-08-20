import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// حل مشکل آیکون‌های پیش‌فرض در react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// نوع props برای کامپوننت
interface SatelliteMapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  markerPosition?: [number, number];
  markerPopup?: string;
  onPositionChange?: (position: [number, number]) => void;
  height?: string;
  mapTile?: string;
}

// کامپوننت داخلی برای تغییر مرکز نقشه
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Map: React.FC<SatelliteMapProps> = ({
  center = [35.6892, 51.3890], // تهران
  zoom = 13,
  markerPosition,
  markerPopup = 'موقعیت انتخاب شده',
  onPositionChange,
  height = '400px',
  mapTile = 'street',
}) => {
  const [position, setPosition] = useState<[number, number] | null>(markerPosition || null);

  // تابع برای تغییر موقعیت با کلیک روی نقشه
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
    setPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  // به‌روزرسانی موقعیت در صورت تغییر props
  useEffect(() => {
    if (markerPosition) {
      setPosition(markerPosition);
    }
  }, [markerPosition]);

  return (
    // <Box style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }} sx={{ '& .leaflet-control-container': { display: 'none !important' } }}>
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', }}
    >
      {mapTile === 'satellite' &&
        <TileLayer
          url="http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={20}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />
      }
      {mapTile === 'street' &&
        <TileLayer
          url="http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}&hl=fa"
          maxZoom={20}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />
      }
    </MapContainer>
    // </Box>
  );
};

export default Map;