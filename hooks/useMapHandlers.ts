'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Feature } from 'geojson';
import { Layer, LatLngBounds, Path } from 'leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { MAP_LEVEL_STYLES, getPropertyStyle } from '@/lib/constants/map';
import { Region } from '@/types';
import { usePropertySheetStore } from '@/store/usePropertySheetStore';
import { useNumberingSessionStore } from '@/store/useNumberingSessionStore';

interface Props {
  regions: Region[];
  selectedRegion: string;
  selectedDistrict: string;
  selectedMahalla: string;
  setSelectedRegion: (id: string) => void;
  setSelectedDistrict: (id: string) => void;
  setSelectedMahalla: (id: string) => void;
  selectedStreet: string;
  setSelectedStreet: (id: string) => void;
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
  selectedStreet,
  setSelectedStreet,
  setMapBounds,
}: Props) {
  // Refs for event handlers to avoid stale closures
  const selectedRegionRef = useRef(selectedRegion);
  const selectedDistrictRef = useRef(selectedDistrict);
  const selectedMahallaRef = useRef(selectedMahalla);
  const selectedStreetRef = useRef(selectedStreet);

  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
    selectedDistrictRef.current = selectedDistrict;
    selectedMahallaRef.current = selectedMahalla;
    selectedStreetRef.current = selectedStreet;
  }, [selectedRegion, selectedDistrict, selectedMahalla, selectedStreet]);

  const handleRegionClick = useCallback(
    (region: Region, bounds: LatLngBounds) => {
      setSelectedRegion(region.id);
      setMapBounds(bounds);
    },
    [setSelectedRegion, setMapBounds],
  );

  const onEachRegion = useCallback(
    (feature: Feature, layer: Layer) => {
      const props = feature.properties as { name: string; id: string };
      layer.bindTooltip(props.name, {
        permanent: false,
        direction: 'center',
        className: 'map-label',
      });

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
          // Block hover if children are selected
          if (selectedDistrictRef.current || selectedMahallaRef.current) return;
          const l = e.target as Path;
          if (typeof l.setStyle === 'function') {
            l.setStyle(MAP_LEVEL_STYLES.highlight.adminBoundary);
          }
        },
        mouseout: (e: { target: Layer }) => {
          const l = e.target as Path;
          const featureId = (feature.properties as { id: string }).id;
          const isSelected = featureId === selectedRegionRef.current;

          if (typeof l.setStyle === 'function') {
            l.setStyle({
              ...MAP_LEVEL_STYLES.adminBoundary,
              weight: isSelected ? 3 : 2,
              opacity:
                selectedDistrictRef.current || selectedMahallaRef.current
                  ? 0.3
                  : 1,
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
      layer.bindTooltip(props.name, {
        permanent: true,
        direction: 'center',
        className: 'map-label',
      });

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
            l.setStyle({
              ...MAP_LEVEL_STYLES.adminBoundary,
              weight: isSelected ? 3 : 2,
            });
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
        permanent: true,
        direction: 'center',
        className: 'map-label',
      });

      layer.on({
        click: (e: {
          target: { getBounds: () => LatLngBounds };
          originalEvent: MouseEvent;
        }) => {
          L.DomEvent.stop(e.originalEvent);
          setSelectedMahalla(props.id);
        },
        mouseover: (e: { target: Layer }) => {
          const l = e.target as Path;
          if (typeof l.setStyle === 'function') {
            l.setStyle(MAP_LEVEL_STYLES.highlight.adminBoundary);
          }
        },
        mouseout: (e: { target: Layer }) => {
          const l = e.target as Path;
          const isSelected = props.id === selectedMahallaRef.current;
          if (typeof l.setStyle === 'function' && !isSelected) {
            l.setStyle({
              ...MAP_LEVEL_STYLES.adminBoundary,
              weight: 2,
            });
          }
        },
      });
    },
    [setSelectedMahalla],
  );

  const onEachStreet = useCallback(
    (feature: Feature, layer: Layer) => {
      const props = feature.properties as { name: string; id: string };

      layer.bindTooltip(props.name, {
        permanent: true,
        direction: 'center',
        className: 'map-label street-label',
      });

      layer.on({
        click: (e: { originalEvent: MouseEvent }) => {
          L.DomEvent.stop(e.originalEvent);
          // The numbering street is fixed for the whole session.
          if (useNumberingSessionStore.getState().isActive) return;
          setSelectedStreet(props.id);
        },
        mouseover: (e: { target: Layer }) => {
          const l = e.target as Path;
          if (typeof l.setStyle === 'function') {
            l.setStyle(MAP_LEVEL_STYLES.highlight.street);
          }
        },
        mouseout: (e: { target: Layer }) => {
          const l = e.target as Path;
          const isSelected = props.id === selectedStreetRef.current;
          if (typeof l.setStyle === 'function' && !isSelected) {
            l.setStyle(MAP_LEVEL_STYLES.street);
          }
        },
      });
    },
    [setSelectedStreet],
  );

  const onEachProperty = useCallback((feature: Feature, layer: Layer) => {
    const props = feature.properties as {
      id: string;
      houseNumber: string | null;
      cadNumber: string | null;
      done: boolean;
      candidate: boolean;
      assignedNumber: number | null;
    };
    const restingStyle = getPropertyStyle(props);

    if (props.assignedNumber !== null) {
      layer.bindTooltip(String(props.assignedNumber), {
        permanent: true,
        direction: 'center',
        className: 'map-label property-number-label',
      });
    } else {
      layer.bindTooltip(props.houseNumber ?? props.cadNumber ?? '', {
        direction: 'top',
        className: 'map-label',
      });
    }

    if (props.candidate) {
      layer.on('add', () => {
        (layer as Path).getElement()?.classList.add('property-candidate');
      });
    }

    layer.on({
      click: (e: { originalEvent: MouseEvent }) => {
        L.DomEvent.stop(e.originalEvent);
        const session = useNumberingSessionStore.getState();
        if (session.isPanelOpen) {
          if (!session.isActive || props.assignedNumber !== null) return;
          if (props.candidate) session.assignNext(props.id);
          else toast.error("Bu bino tanlangan ko'cha yaqinida emas");
          return;
        }
        usePropertySheetStore.getState().openSheet(props.id);
      },
      mouseover: (e: { target: Layer }) => {
        const l = e.target as Path;
        if (typeof l.setStyle === 'function') {
          l.setStyle(MAP_LEVEL_STYLES.highlight.property);
        }
      },
      mouseout: (e: { target: Layer }) => {
        const l = e.target as Path;
        if (typeof l.setStyle === 'function') {
          l.setStyle(restingStyle);
        }
      },
    });
  }, []);

  return {
    onEachRegion,
    onEachDistrict,
    onEachMahalla,
    onEachStreet,
    onEachProperty,
  };
}
