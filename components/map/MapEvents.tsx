'use client';

import { useMapEvents } from 'react-leaflet';

interface MapEventsProps {
  onMapClick: () => void;
}

export function MapEvents({ onMapClick }: MapEventsProps) {
  useMapEvents({
    click: (e) => {
      // If we clicked the map background (not a feature), reset selection
      const container = e.target.getContainer();
      if (e.originalEvent.target === container) {
        onMapClick();
      }
    },
  });
  return null;
}
