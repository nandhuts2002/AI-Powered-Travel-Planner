import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Import leaflet icon assets directly to resolve Vite asset path bug
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Delete the default proto loader and merge options to point to Vite-loaded images
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to auto-recenter map when center coordinates change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

export default function MapWidget({ center, locations = [], activeLocation = null }) {
  // Ensure valid coordinates
  const defaultCenter = [35.6762, 139.6503]; // Tokyo default
  const mapCenter = (center && center.lat && center.lng) 
    ? [center.lat, center.lng] 
    : defaultCenter;

  // Compile list of markers
  const markers = locations.filter(loc => loc && loc.coordinates && loc.coordinates.lat && loc.coordinates.lng);

  return (
    <div style={styles.mapContainer} className="glass-panel">
      <div style={styles.mapHeader}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Interactive Route Explorer</h4>
        <span style={styles.badge}>{markers.length} Points plotted</span>
      </div>
      <div style={styles.mapBody}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Modern elegant light map theme
          />
          
          <ChangeView center={mapCenter} />

          {markers.map((loc, idx) => {
            const isHotel = loc.pricePerNight !== undefined;
            
            // Create a custom icon if desired, or use standard marker
            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="
                background-color: ${isHotel ? 'var(--accent-secondary)' : 'var(--accent-primary)'};
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 0.75rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                border: 2px solid white;
              ">${isHotel ? '🏨' : idx + 1}</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -10]
            });

            return (
              <Marker
                key={`${loc.name || loc.title}-${idx}`}
                position={[loc.coordinates.lat, loc.coordinates.lng]}
                icon={customIcon}
              >
                <Popup>
                  <div style={styles.popup}>
                    <div style={styles.popupType}>{isHotel ? 'ACCOMMODATION' : loc.timeOfDay || 'ATTRACTION'}</div>
                    <h4 style={styles.popupTitle}>{loc.title || loc.name}</h4>
                    <p style={styles.popupDesc}>{loc.description}</p>
                    {isHotel ? (
                      <div style={styles.popupPrice}>Rate: <strong>{loc.pricePerNight}</strong> / night</div>
                    ) : (
                      <div style={styles.popupCost}>Est. Cost: <strong>{loc.costEstimate}</strong></div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

const styles = {
  mapContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '400px',
    overflow: 'hidden',
    marginBottom: '2rem',
  },
  mapHeader: {
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.1)'
  },
  badge: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent-primary)',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontWeight: '700'
  },
  mapBody: {
    flex: 1,
    position: 'relative',
    minHeight: '200px'
  },
  popup: {
    maxWidth: '220px',
    lineHeight: '1.4',
  },
  popupType: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: 'var(--accent-primary)',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem'
  },
  popupTitle: {
    margin: '0 0 0.4rem 0',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  popupDesc: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)'
  },
  popupPrice: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)'
  },
  popupCost: {
    fontSize: '0.8rem',
    color: 'var(--text-primary)'
  }
};
