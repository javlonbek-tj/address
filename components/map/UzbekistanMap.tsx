'use client';

import { useState, useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { LatLngBounds } from 'leaflet';
import type { Region } from '@/lib/generated/prisma/client';
import { MapContainer } from './MapContainer';
import { MAP_LEVEL_STYLES } from '@/lib/constants/map';
import { formatMapStatistics } from '@/lib/utils';
import {
  useMapFilters,
  useMapHandlers,
  useMapFeatures,
  useStats,
} from '@/hooks';
import { MapAutoCenter } from './MapAutoCenter';
import { MapEvents } from './MapEvents';
import { MahallaPopup, MapZoomManager, MapFilters, MapStatistics } from './';
import { MapSpinner } from '../shared';

interface UzbekistanMapProps {
  regions: Region[];
}

export default function UzbekistanMap({ regions }: UzbekistanMapProps) {
  const filterState = useMapFilters();
  const {
    selectedRegion,
    setSelectedRegion,
    selectedDistrict,
    setSelectedDistrict,
    selectedMahalla,
    setSelectedMahalla,
    selectedStreet,
    setSelectedStreet,
    districts,
    mahallas,
    streets,
    isLoading,
  } = filterState;

  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  const { onEachRegion, onEachDistrict, onEachMahalla, onEachStreet } =
    useMapHandlers({
      regions,
      selectedRegion,
      selectedDistrict,
      selectedMahalla,
      selectedStreet,
      setSelectedRegion,
      setSelectedDistrict,
      setSelectedMahalla,
      setSelectedStreet,
      setMapBounds,
    });

  const {
    currentMahalla,
    regionFeatures,
    districtFeatures,
    mahallaFeatures,
    streetFeatures,
  } = useMapFeatures({
    regions,
    districts,
    mahallas,
    streets,
    selectedRegion,
    selectedDistrict,
    selectedMahalla,
  });

  const { statistics } = useStats(selectedRegion, selectedDistrict);

  // Map statistics to display format
  const displayStats = useMemo(
    () => formatMapStatistics(statistics),
    [statistics],
  );

  const handleBackToRegions = () => {
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedMahalla('');
    setMapBounds(null);
  };

  return (
    <div className='relative h-full w-full'>
      <MapFilters
        regions={regions}
        filterState={filterState}
        setMapBounds={setMapBounds}
      />
      <MapStatistics stats={displayStats} />

      {isLoading && <MapSpinner />}
      {selectedMahalla && currentMahalla && (
        <MahallaPopup
          mahalla={currentMahalla}
          onClose={() => setSelectedMahalla('')}
        />
      )}

      <MapContainer>
        <MapAutoCenter bounds={mapBounds} />
        <MapEvents onMapClick={handleBackToRegions} />
        <MapZoomManager />

        {/* Regions Layer */}
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
          style={(feature?: Feature) => {
            const props = feature?.properties as { id: string } | undefined;
            const isSelected = props?.id === selectedRegion;
            return {
              ...MAP_LEVEL_STYLES.adminBoundary,
              weight: isSelected ? 3 : 2,
              opacity: selectedDistrict || selectedMahalla ? 0.2 : 1,
            };
          }}
          onEachFeature={onEachRegion}
        />

        {/* Districts Layer */}
        {selectedRegion && districts.length > 0 && (
          <GeoJSON
            key={`districts-${selectedRegion}-${selectedDistrict}-${selectedMahalla}`}
            data={
              {
                type: 'FeatureCollection',
                features: districtFeatures,
              } as FeatureCollection
            }
            pane='districtsPane'
            style={(feature?: Feature) => {
              const props = feature?.properties as { id: string } | undefined;
              const isSelected = props?.id === selectedDistrict;
              return {
                ...MAP_LEVEL_STYLES.adminBoundary,
                weight: isSelected ? 3 : 2,
              };
            }}
            onEachFeature={onEachDistrict}
          />
        )}

        {/* Mahallas Layer */}
        {selectedDistrict && mahallas.length > 0 && (
          <GeoJSON
            key={`mahallas-${selectedDistrict}-${selectedMahalla}`}
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
                weight: isSelected ? 3 : 2,
              };
            }}
            onEachFeature={onEachMahalla}
          />
        )}

        {/* Streets Layer */}
        {selectedDistrict && streetFeatures.length > 0 && (
          <GeoJSON
            key={`streets-${selectedDistrict}-${selectedMahalla}`}
            data={
              {
                type: 'FeatureCollection',
                features: streetFeatures,
              } as FeatureCollection
            }
            pane='streetsPane'
            style={() => MAP_LEVEL_STYLES.street}
            onEachFeature={onEachStreet}
          />
        )}
      </MapContainer>
    </div>
  );
}
