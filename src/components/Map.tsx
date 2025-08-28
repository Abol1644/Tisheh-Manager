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
});

// نوع props برای کامپوننت
interface SatelliteMapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  markerPosition?: [number, number];
  markerPopup?: string;
  onPositionChange?: (position: [number, number]) => void;
  onCenterChange?: (center: [number, number]) => void; // Callback for center changes
  height?: string;
  mapTile?: 'street' | 'satellite';
  customMarkerIcon?: string; // Path to custom marker image
  markerSize?: [number, number]; // [width, height]
  markerColor?: string; // Color for default marker (if no custom icon)
  markerType?: 'default' | 'custom' | 'svg-pin' | 'svg-circle'; // Marker type
  clickable?: boolean; // Whether map is clickable to add/move markers
  lockView?: boolean; // Whether to lock the view and prevent auto-centering
  flyTo?: boolean; // Whether to use fly animation for center changes
}

// کامپوننت داخلی برای تغییر مرکز نقشه
const ChangeView: React.FC<{ center: [number, number]; zoom: number; flyTo?: boolean }> = ({ center, zoom, flyTo = false }) => {
  const map = useMap();
  const [isFlying, setIsFlying] = useState(false);
  const lastProgrammaticCenter = React.useRef<[number, number]>(center);
  
  useEffect(() => {
    // Only respond to flyTo changes, not regular center changes
    if (!flyTo) return;
    
    // Only change center if it actually changed
    const currentCenter = map.getCenter();
    
    if (
      Math.abs(currentCenter.lat - center[0]) > 0.0001 || 
      Math.abs(currentCenter.lng - center[1]) > 0.0001
    ) {
      // Don't start new flyTo if we're already flying
      if (isFlying) return;
      
      setIsFlying(true);
      lastProgrammaticCenter.current = center;
      map.flyTo(center, zoom, { duration: 2 });
      // Reset flying state after animation completes
      setTimeout(() => setIsFlying(false), 4000);
    }
  }, [map, center, zoom, flyTo]);
  
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


// کامپوننت برای track کردن center changes
const MapCenterTracker: React.FC<{ onCenterChange: (center: [number, number]) => void }> = ({ onCenterChange }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      onCenterChange([center.lat, center.lng]);
    };
    
    map.on('moveend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onCenterChange]);
  
  return null;
};

const Map: React.FC<SatelliteMapProps> = ({
  center = [35.6892, 51.3890], // تهران
  zoom = 22,
  markerPosition,
  markerPopup = 'موقعیت انتخاب شده',
  onPositionChange,
  onCenterChange,
  height = '400px',
  mapTile = 'street',
  customMarkerIcon,
  markerSize = [25, 41], // Default leaflet marker size
  markerColor = '#3388ff',
  markerType = 'default',
  clickable = true,
  lockView = false,
  flyTo = false,
}) => {
  const [position, setPosition] = useState<[number, number] | null>(markerPosition || null);

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
    // Only update if map is clickable and callback is provided
    if (clickable && onPositionChange) {
      setPosition(newPosition);
      onPositionChange(newPosition);
    }
  };

  // به‌روزرسانی موقعیت فقط در صورت تغییر خارجی props
  useEffect(() => {
    if (markerPosition && markerPosition !== position) {
      setPosition(markerPosition);
    }
  }, [markerPosition]); // Removed position from dependencies to prevent unnecessary updates

  return (
    // <Box style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }} sx={{ '& .leaflet-control-container': { display: 'none !important' } }}>
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', }}
      zoomControl={true}
    >
      {/* Google Satellite */}
      {mapTile === 'satellite' ? (
        <TileLayer
          key="google-satellite"
          url="https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={20}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          attribution='&copy; Google'
        />
      ) : (
        /* Google Street */
        <TileLayer
          key="google-street"
          url="https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}&hl=fa"
          maxZoom={20}
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          attribution='&copy; Google'
        />
      )}
      
      {/* Change View Component - only if not locked */}
      {!lockView && <ChangeView center={center} zoom={zoom} flyTo={flyTo} />}
      
      {/* Map Event Handler - only if clickable */}
      {clickable && onPositionChange && <MapEventHandler onMapClick={handleMapClick} />}
      
      {/* Map Center Tracker - track center changes */}
      {onCenterChange && <MapCenterTracker onCenterChange={onCenterChange} />}
      
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