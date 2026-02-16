'use client';

import { MapContainer as RLMapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is available to this component
import { baseMaps } from '@/lib';
import { MapPanes } from './MapPanes';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export const MapContainer = ({
  children,
  className = 'h-full w-full',
}: Props) => {
  return (
    <RLMapContainer
      center={[41.377, 64.585]} // Default center: Uzbekistan
      zoom={6}
      className={className}
      zoomControl={true}
    >
      <TileLayer
        url={baseMaps.osm.url}
        attribution={baseMaps.osm.attribution}
      />
      <MapPanes />
      {children}
    </RLMapContainer>
  );
};
