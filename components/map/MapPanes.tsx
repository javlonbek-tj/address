'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapPanes = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const panes = [
      { name: 'regionsPane', zIndex: 'var(--z-map-pane-regions)' },
      { name: 'districtsPane', zIndex: 'var(--z-map-pane-districts)' },
      { name: 'mahallasPane', zIndex: 'var(--z-map-pane-mahallas)' },
      { name: 'propertiesPane', zIndex: 'var(--z-map-pane-properties)' },
      { name: 'streetsPane', zIndex: 'var(--z-map-pane-streets)' },
    ];

    panes.forEach(({ name, zIndex }) => {
      if (!map.getPane(name)) {
        const pane = map.createPane(name);
        pane.style.zIndex = zIndex.toString();
      }
    });
  }, [map]);

  return null;
};
