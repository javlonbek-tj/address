'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Feature } from 'geojson';
import { Layer, LatLngBounds, Path } from 'leaflet';
import L from 'leaflet';
import { Region } from '@/lib/generated/prisma/client';
import { MAP_LEVEL_STYLES } from '@/lib/constants/map';

interface UseMapHandlersProps {
  regions: Region[];
  selectedRegion: string;
  selectedDistrict: string;
  selectedMahalla: string;
  setSelectedRegion: (id: string) => void;
  setSelectedDistrict: (id: string) => void;
  setSelectedMahalla: (id: string) => void;
  setMapBounds: (bounds: LatLngBounds | null) => void;
}

export function useMapHandlers({
  regions,
  selectedRegion,
  selectedDistrict,
  selectedMahalla,
  setSelectedRegion,
  setSelectedDistrict,
  setSelectedMahalla,
  setMapBounds,
}: UseMapHandlersProps) {
  // Refs for event handlers to avoid stale closures
  const selectedRegionRef = useRef(selectedRegion);
  const selectedDistrictRef = useRef(selectedDistrict);
  const selectedMahallaRef = useRef(selectedMahalla);

  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
    selectedDistrictRef.current = selectedDistrict;
    selectedMahallaRef.current = selectedMahalla;
  }, [selectedRegion, selectedDistrict, selectedMahalla]);

  const handleRegionClick = useCallback(
    (region: Region, bounds: LatLngBounds) => {
      setSelectedRegion(region.id);
      setMapBounds(bounds);
    },
    [setSelectedRegion, setMapBounds],
  );

  const onEachRegion = useCallback(
    (feature: Feature, layer: Layer) => {
      layer.on({
        click: (e: {
          target: { getBounds: () => LatLngBounds };
          originalEvent: MouseEvent;
        }) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          const props = feature.properties as { id: string };
          const region = regions.find((r) => r.id === props.id);
          const bounds = e.target.getBounds();
          if (region) {
            handleRegionClick(region, bounds);
          }
        },
        mouseover: (e: { target: Layer }) => {
          const l = e.target as Path;
          if (typeof l.setStyle === 'function') {
            l.setStyle(MAP_LEVEL_STYLES.highlight.adminBoundary);
          }
        },
        mouseout: (e: { target: Layer }) => {
          const l = e.target as Path;
          const featureId = (feature.properties as { id: string }).id;
          const isSelected = featureId === selectedRegionRef.current;
          const hasSelection = !!selectedRegionRef.current;

          if (typeof l.setStyle === 'function') {
            l.setStyle({
              ...MAP_LEVEL_STYLES.adminBoundary,
              opacity: !hasSelection || isSelected ? 1 : 0.3,
              weight: isSelected ? 3 : 2,
            });
          }
        },
      });
    },
    [regions, handleRegionClick],
  );

  const onEachDistrict = useCallback(
    (feature: Feature, layer: Layer) => {
      const props = feature.properties as { name: string; id: string };

      layer.on({
        click: (e: {
          target: { getBounds: () => LatLngBounds };
          originalEvent: MouseEvent;
        }) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          setSelectedDistrict(props.id);
          const bounds = e.target.getBounds();
          setMapBounds(bounds);
        },
        mouseover: (e: { target: Layer }) => {
          const l = e.target as Path;
          if (typeof l.setStyle === 'function') {
            l.setStyle(MAP_LEVEL_STYLES.highlight.adminBoundary);
          }
        },
        mouseout: (e: { target: Layer }) => {
          const l = e.target as Path;
          const isSelected = props.id === selectedDistrictRef.current;
          if (typeof l.setStyle === 'function') {
            l.setStyle(
              isSelected
                ? MAP_LEVEL_STYLES.highlight.adminBoundary
                : MAP_LEVEL_STYLES.adminBoundary,
            );
          }
        },
      });
    },
    [setSelectedDistrict, setMapBounds],
  );

  const onEachMahalla = useCallback(
    (feature: Feature, layer: Layer) => {
      const props = feature.properties as { name: string; id: string };
      layer.bindTooltip(props.name, {
        permanent: false,
        direction: 'center',
        className:
          'bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-xs font-medium',
      });

      layer.on({
        click: (e: {
          target: { getBounds: () => LatLngBounds };
          originalEvent: MouseEvent;
        }) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          setSelectedMahalla(props.id);
          const bounds = e.target.getBounds();
          setMapBounds(bounds);
        },
        mouseover: (e: { target: Layer }) => {
          const l = e.target as Path;
          if (typeof l.setStyle === 'function') {
            l.setStyle(MAP_LEVEL_STYLES.highlight.mahalla);
          }
        },
        mouseout: (e: { target: Layer }) => {
          const l = e.target as Path;
          const isSelected = props.id === selectedMahallaRef.current;
          if (typeof l.setStyle === 'function') {
            l.setStyle(
              isSelected
                ? MAP_LEVEL_STYLES.highlight.mahalla
                : MAP_LEVEL_STYLES.mahalla,
            );
          }
        },
      });
    },
    [setSelectedMahalla, setMapBounds],
  );

  return { onEachRegion, onEachDistrict, onEachMahalla };
}
