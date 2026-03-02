'use client';

import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useEffect, useState } from 'react';
import { MAP_LEVEL_STYLES } from '@/lib/constants/map';

const { BaseLayer } = LayersControl;

interface DetailMapProps {
  geometry: any;
}

export default function DetailMap({ geometry }: DetailMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  const geoData = useMemo(() => {
    if (!geometry) return null;
    return {
      type: 'Feature',
      geometry: geometry,
      properties: {},
    };
  }, [geometry]);

  useEffect(() => {
    if (map && geoData) {
      try {
        const layer = L.geoJSON(geoData as any);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [map, geoData]);

  if (!geoData) return null;

  return (
    <MapContainer
      center={[41.2995, 69.2401]}
      zoom={6}
      className='w-full h-full'
      ref={setMap}
      zoomControl={true}
      attributionControl={false}
    >
      <LayersControl position='topright'>
        <BaseLayer name='Xarita'>
          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        </BaseLayer>
        <BaseLayer checked name='Sputnik'>
          <TileLayer
            url='https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            attribution='&copy; Google'
            className='sputnik-layer'
          />
        </BaseLayer>
      </LayersControl>
      <GeoJSON
        data={geoData as any}
        style={{ ...MAP_LEVEL_STYLES.adminBoundary, weight: 4 }}
      />
    </MapContainer>
  );
}
