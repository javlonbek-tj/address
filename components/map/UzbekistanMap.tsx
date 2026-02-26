'use client';

import { useState, useMemo } from 'react';
import { GeoJSON, Marker } from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import type { Region } from '@/lib/generated/prisma/client';
import { MapContainer } from './MapContainer';
import { MAP_LEVEL_STYLES } from '@/lib/constants/map';
import { formatMapStatistics } from '@/lib/utils';
import { useMapFilters } from '@/hooks/useMapFilters';
import { useMapFeatures } from '@/hooks/useMapFeatures';
import { useStats } from '@/hooks/useStats';
import { useMapHighlighting } from '@/hooks/useMapHighlighting';
import { MapAutoCenter } from './MapAutoCenter';
import { MapEvents } from './MapEvents';
import {
  MapZoomManager,
  MapFilters,
  MapStatistics,
  MapLayersControl,
  MapControls,
  StreetPopup,
} from './';
import { Spinner } from '../shared';
import { useMapHandlers } from '@/hooks/useMapHandlers';

interface UzbekistanMapProps {
  regions: Region[];
}
import { useMapFilterStore } from '@/store/useMapFilterStore';

export default function UzbekistanMap({ regions }: UzbekistanMapProps) {
  const { districts, mahallas, streets, properties, isLoading } =
    useMapFilters();

  const {
    selectedRegion,
    setSelectedRegion,
    selectedDistrict,
    setSelectedDistrict,
    selectedMahalla,
    setSelectedMahalla,
    selectedStreet,
    setSelectedStreet,
    showRegions,
    showDistricts,
    showMahallas,
    showStreets,
    showProperties,
    baseMap,
    setBaseMap,
  } = useMapFilterStore();

  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  const {
    onEachRegion,
    onEachDistrict,
    onEachMahalla,
    onEachStreet,
    onEachProperty,
  } = useMapHandlers({
    regions,
    selectedRegion,
    selectedDistrict,
    selectedMahalla,
    properties,
    setSelectedRegion,
    setSelectedDistrict,
    setSelectedMahalla,
    selectedStreet,
    setSelectedStreet,
    setMapBounds,
  });

  const {
    currentStreet,
    regionFeatures,
    districtFeatures,
    mahallaFeatures,
    streetFeatures,
    propertyFeatures,
  } = useMapFeatures({
    regions,
    districts,
    mahallas,
    streets,
    properties,
    selectedRegion,
    selectedDistrict,
    selectedMahalla,
    selectedStreet,
  });

  const { statistics } = useStats(selectedRegion, selectedDistrict);

  const { mahallaLayerRef, streetLayerRef } = useMapHighlighting({
    selectedMahalla,
    selectedStreet,
    baseMap,
  });

  const displayStats = useMemo(
    () => formatMapStatistics(statistics),
    [statistics],
  );

  const handleBackToRegions = () => {
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedMahalla('');
    setSelectedStreet('');
    setMapBounds(null);
  };

  return (
    <div className='relative w-full h-full'>
      <MapFilters
        regions={regions}
        filterState={{ districts, mahallas, streets, isLoading }}
        setMapBounds={setMapBounds}
      />
      <MapStatistics stats={displayStats} />
      <MapLayersControl />
      <MapControls />

      {isLoading && <Spinner size='sm' />}

      <MapContainer baseMap={baseMap}>
        <MapAutoCenter bounds={mapBounds} />
        <MapEvents onMapClick={handleBackToRegions} />
        <MapZoomManager />

        {currentStreet && showStreets && (
          <StreetPopup
            street={currentStreet}
            onClose={() => {
              setSelectedStreet('');
              setSelectedMahalla('');
            }}
          />
        )}

        {/* Regions Layer */}
        {showRegions && (
          <GeoJSON
            key={`regions-${selectedRegion}-${selectedDistrict}-${selectedMahalla}`}
            data={
              {
                type: 'FeatureCollection',
                features: regionFeatures,
              } as FeatureCollection
            }
            pane='regionsPane'
            interactive={true}
            style={() => {
              return {
                ...MAP_LEVEL_STYLES.adminBoundary,
                opacity: selectedDistrict || selectedMahalla ? 0.3 : 1,
              };
            }}
            onEachFeature={onEachRegion}
          />
        )}

        {/* Districts Layer */}
        {showDistricts && selectedRegion && districts.length > 0 && (
          <GeoJSON
            key={`districts-${selectedRegion}-${selectedDistrict}-${selectedMahalla}`}
            data={
              {
                type: 'FeatureCollection',
                features: districtFeatures,
              } as FeatureCollection
            }
            pane='districtsPane'
            style={MAP_LEVEL_STYLES.adminBoundary}
            onEachFeature={onEachDistrict}
          />
        )}

        {/* Mahallas Layer */}
        {showMahallas && selectedDistrict && mahallas.length > 0 && (
          <GeoJSON
            key={`mahallas-${selectedDistrict}`}
            data={
              {
                type: 'FeatureCollection',
                features: mahallaFeatures,
              } as FeatureCollection
            }
            pane='mahallasPane'
            style={(feature?: Feature) => {
              const props = feature?.properties as { id: string } | undefined;
              const isSelected = props?.id === selectedMahalla;
              return {
                ...MAP_LEVEL_STYLES.adminBoundary,
                weight: isSelected ? 4 : 2,
              };
            }}
            onEachFeature={onEachMahalla}
            ref={mahallaLayerRef}
          />
        )}

        {/* Properties Layer */}
        {showProperties && selectedMahalla && propertyFeatures.length > 0 && (
          <GeoJSON
            key={`properties-${selectedMahalla}`}
            data={
              {
                type: 'FeatureCollection',
                features: propertyFeatures,
              } as FeatureCollection
            }
            pane='propertiesPane'
            style={MAP_LEVEL_STYLES.property}
            onEachFeature={onEachProperty}
          />
        )}

        {/* Streets Layer */}
        {showStreets && selectedDistrict && streetFeatures.length > 0 && (
          <GeoJSON
            key={`streets-${selectedDistrict}`}
            data={
              {
                type: 'FeatureCollection',
                features: streetFeatures,
              } as FeatureCollection
            }
            pane='streetsPane'
            style={(feature?: Feature) => {
              const props = feature?.properties as { id: string } | undefined;
              const isSelected = props?.id === selectedStreet;
              if (baseMap === 'satellite') {
                return isSelected
                  ? MAP_LEVEL_STYLES.satellite.highlight.street
                  : MAP_LEVEL_STYLES.satellite.street;
              }
              return isSelected
                ? MAP_LEVEL_STYLES.highlight.street
                : MAP_LEVEL_STYLES.street;
            }}
            onEachFeature={onEachStreet}
            ref={streetLayerRef}
          />
        )}

        {/* Direction Arrow at the end point */}
        {currentStreet?.metadata?.endPoint && showStreets && (
          <Marker
            position={[
              currentStreet.metadata.endPoint.lat,
              currentStreet.metadata.endPoint.lng,
            ]}
            icon={L.divIcon({
              className: 'street-direction-arrow',
              html: `<div style="transform: rotate(${
                currentStreet.metadata.bearing || 0
              }deg); color: #1d4ed8; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                </svg>
              </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
            interactive={false}
          />
        )}
      </MapContainer>
    </div>
  );
}
