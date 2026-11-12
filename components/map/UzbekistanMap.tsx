'use client';

import { useState, useMemo, useEffect } from 'react';
import { GeoJSON, Marker } from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import { Feature, FeatureCollection } from 'geojson';
import { MapContainer } from './MapContainer';
import { MAP_LEVEL_STYLES, getPropertyStyle } from '@/lib/constants/map';
import { formatMapStatistics } from '@/lib/utils';
import { useMapFilters } from '@/hooks/useMapFilters';
import { useMapFeatures } from '@/hooks/useMapFeatures';
import { useProperties } from '@/hooks/useProperties';
import { usePropertySheetStore } from '@/store/usePropertySheetStore';
import { useNumberingSessionStore } from '@/store/useNumberingSessionStore';
import { PropertyPanel } from './PropertyPanel';
import { NumberingModePanel } from './NumberingModePanel';
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
import { useMapAuthSync } from '@/hooks/useMapAuthSync';

interface UzbekistanMapProps {
  regions: Region[];
}
import { useMapFilterStore } from '@/store/useMapFilterStore';
import { Region } from '@/types';
import { useSession } from '@/lib/auth/auth-client';
import { UserRole } from '@/lib/generated/prisma/enums';

export default function UzbekistanMap({ regions }: UzbekistanMapProps) {
  const { data: session } = useSession();
  const { districts, mahallas, streets, isLoading } = useMapFilters();

  const selectedRegion = useMapFilterStore((state) => state.selectedRegion);
  const setSelectedRegion = useMapFilterStore(
    (state) => state.setSelectedRegion,
  );
  const selectedDistrict = useMapFilterStore((state) => state.selectedDistrict);
  const setSelectedDistrict = useMapFilterStore(
    (state) => state.setSelectedDistrict,
  );
  const selectedMahalla = useMapFilterStore((state) => state.selectedMahalla);
  const setSelectedMahalla = useMapFilterStore(
    (state) => state.setSelectedMahalla,
  );
  const selectedStreet = useMapFilterStore((state) => state.selectedStreet);
  const setSelectedStreet = useMapFilterStore(
    (state) => state.setSelectedStreet,
  );
  const showRegions = useMapFilterStore((state) => state.showRegions);
  const showDistricts = useMapFilterStore((state) => state.showDistricts);
  const showMahallas = useMapFilterStore((state) => state.showMahallas);
  const showStreets = useMapFilterStore((state) => state.showStreets);
  const showProperties = useMapFilterStore((state) => state.showProperties);
  const baseMap = useMapFilterStore((state) => state.baseMap);
  const resetFilters = useMapFilterStore((state) => state.resetFilters);

  const closePropertySheet = usePropertySheetStore((state) => state.closeSheet);
  const isNumberingPanelOpen = useNumberingSessionStore((state) => state.isPanelOpen);
  const numberingStreetId = useNumberingSessionStore((state) => state.streetId);
  const isNumbering = useNumberingSessionStore((state) => state.isActive);
  const numberingAssignments = useNumberingSessionStore((state) => state.assignments);
  const endNumberingSession = useNumberingSessionStore((state) => state.endSession);
  const activeNumberingStreetId = isNumberingPanelOpen ? numberingStreetId : '';

  useEffect(() => {
    return () => {
      resetFilters();
      closePropertySheet();
      endNumberingSession();
    };
  }, [resetFilters, closePropertySheet, endNumberingSession]);

  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  // While numbering a street, load the whole district: streets can cross mahalla borders.
  const { properties, dataUpdatedAt: propertiesUpdatedAt } = useProperties(
    selectedDistrict,
    activeNumberingStreetId ? undefined : selectedMahalla || undefined,
  );

  // Synchronization with session (Authorization & Auto-initialization)
  useMapAuthSync({
    regions,
    districts,
    mapBounds,
    setMapBounds,
  });

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
    candidateCount,
  } = useMapFeatures({
    regions,
    districts,
    mahallas,
    streets,
    properties,
    numberingStreetId: activeNumberingStreetId,
    assignments: numberingAssignments,
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
    // Keep the selection during semi-auto numbering; empty-map clicks happen while clicking along a street.
    if (isNumbering) return;
    if (
      session?.user?.role === UserRole.district_user ||
      session?.user?.role === UserRole.region_user
    ) {
      // Restricted users shouldn't reset their primary filters
      return;
    }
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedMahalla('');
    setSelectedStreet('');
    setMapBounds(null);
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 h-full ${isNumbering ? 'numbering-mode' : ''}`}>
      <MapFilters
        regions={regions}
        filterState={{ districts, mahallas, streets, isLoading }}
        setMapBounds={setMapBounds}
      />
      <MapStatistics stats={displayStats} />
      <PropertyPanel />
      <NumberingModePanel candidateCount={candidateCount} />
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

        {/* Properties Layer — hidden below ZOOM_THRESHOLDS.PROPERTY via the zoom-properties class */}
        {showProperties && selectedDistrict && propertyFeatures.length > 0 && (
          <GeoJSON
            key={`properties-${selectedDistrict}-${selectedMahalla}-${propertiesUpdatedAt}-${activeNumberingStreetId}-${isNumbering}-${numberingAssignments.length}`}
            data={
              {
                type: 'FeatureCollection',
                features: propertyFeatures,
              } as FeatureCollection
            }
            pane='propertiesPane'
            style={(feature?: Feature) => {
              const props = feature?.properties as Parameters<typeof getPropertyStyle>[0];
              return getPropertyStyle(props);
            }}
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
                features: streetFeatures.filter(
                  (f) =>
                    f?.geometry &&
                    'coordinates' in f.geometry &&
                    Array.isArray(f.geometry.coordinates) &&
                    f.geometry.coordinates.length > 0,
                ),
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
