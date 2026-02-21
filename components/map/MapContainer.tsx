'use client';

import { MapContainer as RLMapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is available to this component
import { baseMaps } from '@/lib';
import { MapPanes } from './MapPanes';
import { MapResizeHandler } from './MapResizeHandler';

interface Props {
  children?: React.ReactNode;
  className?: string;
  baseMap?: BaseMapKey;
}

import { BaseMapKey } from '@/lib/constants/map';

export const MapContainer = ({
  children,
  className = 'h-full w-full',
  baseMap = 'osm',
}: Props) => {
  const selectedBase = baseMaps[baseMap];

  return (
    <RLMapContainer
      center={[41.377, 64.585]} // Default center: Uzbekistan
      zoom={6}
      className={className}
      zoomControl={true}
    >
      <TileLayer
        url={selectedBase.url}
        attribution={selectedBase.attribution}
      />
      <MapPanes />
      <MapResizeHandler />
      {children}
    </RLMapContainer>
  );
};
