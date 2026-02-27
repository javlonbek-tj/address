'use client';

import { useMapEvents } from 'react-leaflet';
import { useEffect, useCallback, useRef } from 'react';
import { useMapFilterStore } from '@/store/useMapFilterStore';
import { ZOOM_THRESHOLDS } from '@/lib/constants/map';

export function MapZoomManager() {
  const {
    selectedStreet,
    selectedMahalla,
    selectedDistrict,
    selectedRegion,
    setSelectedStreet,
    setSelectedMahalla,
    setSelectedDistrict,
    setSelectedRegion,
  } = useMapFilterStore();

  // Cache current values in refs to avoid re-running effects too much if needed,
  // but here we just need them in the callback.
  const stateRef = useRef({
    selectedStreet,
    selectedMahalla,
    selectedDistrict,
    selectedRegion,
  });

  useEffect(() => {
    stateRef.current = {
      selectedStreet,
      selectedMahalla,
      selectedDistrict,
      selectedRegion,
    };
  }, [selectedStreet, selectedMahalla, selectedDistrict, selectedRegion]);

  const map = useMapEvents({
    zoomend: () => {
      const zoom = map.getZoom();
      updateZoomClass(zoom);
      handleZoomBasedClearing(zoom);
    },
  });

  const handleZoomBasedClearing = useCallback(
    (zoom: number) => {
      const {
        selectedStreet,
        selectedMahalla,
        selectedDistrict,
        selectedRegion,
      } = stateRef.current;

      if (selectedStreet && zoom < ZOOM_THRESHOLDS.STREET) {
        setSelectedStreet('');
      }

      if (selectedMahalla && zoom < ZOOM_THRESHOLDS.MAHALLA) {
        setSelectedMahalla('');
      }

      if (selectedDistrict && zoom < ZOOM_THRESHOLDS.DISTRICT) {
        setSelectedDistrict('');
      }

      if (selectedRegion && zoom < ZOOM_THRESHOLDS.REGION) {
        setSelectedRegion('');
      }
    },
    [
      setSelectedStreet,
      setSelectedMahalla,
      setSelectedDistrict,
      setSelectedRegion,
    ],
  );

  const updateZoomClass = useCallback(
    (zoomLevel?: number) => {
      const zoom = zoomLevel ?? map.getZoom();
      const container = map.getContainer();

      if (zoom >= 16) {
        container.classList.add('zoom-high');
      } else {
        container.classList.remove('zoom-high');
      }
    },
    [map],
  );

  useEffect(() => {
    updateZoomClass();
  }, [updateZoomClass]);

  return null;
}
