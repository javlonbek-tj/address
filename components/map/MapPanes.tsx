'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapPanes = () => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const panes = [
      { name: 'regionsPane', zIndex: 350 },
      { name: 'districtsPane', zIndex: 400 },
      { name: 'mahallasPane', zIndex: 450 },
      { name: 'streetsPane', zIndex: 500 },
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
