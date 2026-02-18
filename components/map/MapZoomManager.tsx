'use client';

import { useMapEvents } from 'react-leaflet';
import { useEffect, useCallback } from 'react';

export function MapZoomManager() {
  const map = useMapEvents({
    zoomend: () => {
      updateZoomClass();
    },
  });

  const updateZoomClass = useCallback(() => {
    const zoom = map.getZoom();
    const container = map.getContainer();

    if (zoom >= 16) {
      container.classList.add('zoom-high');
    } else {
      container.classList.remove('zoom-high');
    }
  }, [map]);

  useEffect(() => {
    updateZoomClass();
  }, [updateZoomClass]);

  return null;
}
