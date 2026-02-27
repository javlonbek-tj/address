'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer as RLMapContainer, TileLayer } from 'react-leaflet';
import { baseMaps, BaseMapKey } from '@/lib/constants/map';
import { MapPanes } from './MapPanes';
import { MapResizeHandler } from './MapResizeHandler';

interface Props {
  children?: React.ReactNode;
  className?: string;
  baseMap?: BaseMapKey;
}

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
      maxZoom={selectedBase.maxZoom + 1}
      className={className}
      zoomControl={true}
    >
      <TileLayer
        url={selectedBase.url}
        attribution={selectedBase.attribution}
        maxZoom={selectedBase.maxZoom + 1}
        maxNativeZoom={selectedBase.maxZoom}
        crossOrigin='anonymous'
      />
      <MapPanes />
      <MapResizeHandler />
      {children}
    </RLMapContainer>
  );
};
