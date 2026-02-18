'use client';

import { useMapEvents } from 'react-leaflet';

interface MapEventsProps {
  onMapClick: () => void;
}

export function MapEvents({ onMapClick }: MapEventsProps) {
  useMapEvents({
    click: (e) => {
      // If we clicked the map background (not a feature or its containers), reset selection
      const target = e.originalEvent.target as HTMLElement;
      if (
        target === e.target.getContainer() ||
        target.classList.contains('leaflet-container')
      ) {
        onMapClick();
      }
    },
  });
  return null;
}
