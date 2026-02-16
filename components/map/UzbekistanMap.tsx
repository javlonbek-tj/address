'use client';

import { useState, useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import { Geometry, Feature, FeatureCollection } from 'geojson';
import { LatLngBounds } from 'leaflet';
import { Region } from '@/lib/generated/prisma/client';
import { MapContainer } from './MapContainer';
import { MAP_LEVEL_STYLES } from '@/lib/constants/map';
import { useMapFilters } from '@/hooks/useMapFilters';
import { useMapHandlers } from '@/hooks/useMapHandlers';
import { MapAutoCenter } from './MapAutoCenter';
import { MapEvents } from './MapEvents';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface UzbekistanMapProps {
  regions: Region[];
}

export default function UzbekistanMap({ regions }: UzbekistanMapProps) {
  const {
    selectedRegion,
    setSelectedRegion,
    selectedDistrict,
    setSelectedDistrict,
    selectedMahalla,
    setSelectedMahalla,
    districts,
    mahallas,
    isLoading,
  } = useMapFilters();

  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  const { onEachRegion, onEachDistrict, onEachMahalla } = useMapHandlers({
    regions,
    selectedRegion,
    selectedDistrict,
    selectedMahalla,
    setSelectedRegion,
    setSelectedDistrict,
    setSelectedMahalla,
    setMapBounds,
  });

  const handleBackToRegions = () => {
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedMahalla('');
    setMapBounds(null);
  };

  // Convert Prisma Json to GeoJSON items
  const regionFeatures = useMemo(
    () =>
      regions.map((r) => ({
        type: 'Feature' as const,
        properties: { id: r.id, name: r.name, code: r.code },
        geometry: r.geometry as unknown as Geometry,
      })),
    [regions],
  );

  const districtFeatures = useMemo(
    () =>
      districts.map((d) => ({
        type: 'Feature' as const,
        properties: { id: d.id, name: d.name, code: d.code },
        geometry: d.geometry as unknown as Geometry,
      })),
    [districts],
  );

  const mahallaFeatures = useMemo(
    () =>
      mahallas.map((m) => ({
        type: 'Feature' as const,
        properties: { id: m.id, name: m.name },
        geometry: m.geometry as unknown as Geometry,
      })),
    [mahallas],
  );

  return (
    <div className='relative h-full w-full'>
      {(selectedRegion || selectedDistrict || selectedMahalla || isLoading) && (
        <div className='absolute top-4 left-4 z-1000 flex items-center gap-2'>
          {(selectedRegion || selectedDistrict || selectedMahalla) && (
            <Button
              variant='secondary'
              size='sm'
              onClick={handleBackToRegions}
              className='shadow-md'
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Viloyatlarga qaytish
            </Button>
          )}
        </div>
      )}

      <MapContainer>
        <MapAutoCenter bounds={mapBounds} />
        <MapEvents onMapClick={handleBackToRegions} />

        <GeoJSON
          data={
            {
              type: 'FeatureCollection',
              features: regionFeatures,
            } as FeatureCollection
          }
          pane='regionsPane'
          style={(feature?: Feature) => {
            const props = feature?.properties as { id: string } | undefined;
            const isSelected = props?.id === selectedRegion;
            const hasSelection = !!selectedRegion;
            return {
              ...MAP_LEVEL_STYLES.adminBoundary,
              fillOpacity: 0,
              opacity: !hasSelection || isSelected ? 1 : 0.3,
              weight: isSelected ? 3 : 2,
            };
          }}
          onEachFeature={onEachRegion}
        />

        {selectedRegion && districts.length > 0 && (
          <GeoJSON
            key={`districts-${selectedRegion}`}
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
              return isSelected
                ? MAP_LEVEL_STYLES.highlight.adminBoundary
                : MAP_LEVEL_STYLES.adminBoundary;
            }}
            onEachFeature={onEachDistrict}
          />
        )}

        {selectedDistrict && mahallas.length > 0 && (
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
              return isSelected
                ? MAP_LEVEL_STYLES.highlight.mahalla
                : MAP_LEVEL_STYLES.mahalla;
            }}
            onEachFeature={onEachMahalla}
          />
        )}
      </MapContainer>
    </div>
  );
}
