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
  customMarkerIcon?: string; // Path to custom marker image
  markerSize?: [number, number]; // [width, height]
  markerColor?: string; // Color for default marker (if no custom icon)
  markerType?: 'default' | 'custom' | 'svg-pin' | 'svg-circle'; // Marker type
}

// کامپوننت داخلی برای تغییر مرکز نقشه
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// کامپوننت برای handle کردن click events
const MapEventHandler: React.FC<{ onMapClick: (e: L.LeafletMouseEvent) => void }> = ({ onMapClick }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
  return null;
};

// کامپوننت برای handle کردن tile errors
const TileErrorHandler: React.FC<{ onTileError: () => void }> = ({ onTileError }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleTileError = () => {
      onTileError();
    };
    
    map.on('tileerror', handleTileError);
    
    return () => {
      map.off('tileerror', handleTileError);
    };
  }, [map, onTileError]);
  
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
  customMarkerIcon,
  markerSize = [25, 41], // Default leaflet marker size
  markerColor = '#3388ff',
  markerType = 'default',
}) => {
  const [position, setPosition] = useState<[number, number] | null>(markerPosition || null);
  const [tileError, setTileError] = useState(false);

  // Create SVG marker icons
  const createSVGIcon = (type: string, color: string, size: [number, number]) => {
    let svgContent = '';
    
    if (type === 'svg-pin') {
      svgContent = `
        <svg width="${size[0]}" height="${size[1]}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#fff" stroke-width="2"/>
          <circle cx="12" cy="9" r="2.5" fill="#fff"/>
        </svg>
      `;
    } else if (type === 'svg-circle') {
      svgContent = `
        <svg width="${size[0]}" height="${size[1]}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="${color}" stroke="#fff" stroke-width="3"/>
          <circle cx="12" cy="12" r="3" fill="#fff"/>
        </svg>
      `;
    }
    
    const svgURL = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    
    return new L.Icon({
      iconUrl: svgURL,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1] / 2],
      popupAnchor: [0, -size[1] / 2],
    });
  };

  // Create appropriate icon based on type
  const getMarkerIcon = () => {
    if (markerType === 'custom' && customMarkerIcon) {
      return new L.Icon({
        iconUrl: customMarkerIcon,
        iconSize: markerSize,
        iconAnchor: [markerSize[0] / 2, markerSize[1]], 
        popupAnchor: [0, -markerSize[1]],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
      });
    } else if (markerType === 'svg-pin' || markerType === 'svg-circle') {
      return createSVGIcon(markerType, markerColor, markerSize);
    }
    return undefined; // Use default Leaflet marker
  };

  const markerIcon = getMarkerIcon();

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
      {mapTile === 'satellite' && !tileError ? (
        <TileLayer
          key="google-satellite"
          url="https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={20}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          attribution='&copy; Google'
        />
      ) : mapTile === 'satellite' && tileError ? (
        <TileLayer
          key="esri-satellite"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
      ) : mapTile === 'street' && !tileError ? (
        <TileLayer
          key="google-street"
          url="https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}&hl=fa"
          maxZoom={20}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          attribution='&copy; Google'
        />
      ) : (
        <TileLayer
          key="openstreetmap"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      )}
      
      {/* Change View Component */}
      <ChangeView center={center} zoom={zoom} />
      
      {/* Map Event Handler */}
      {onPositionChange && <MapEventHandler onMapClick={handleMapClick} />}
      
      {/* Tile Error Handler - for both satellite and street tiles */}
      {!tileError && (
        <TileErrorHandler onTileError={() => setTileError(true)} />
      )}
      
      {/* Marker */}
      {position && (
        <Marker position={position} icon={markerIcon}>
          <Popup>{markerPopup}</Popup>
        </Marker>
      )}
    </MapContainer>
    // </Box>
  );
};

export default Map;