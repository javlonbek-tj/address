'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useMapFilterStore } from '@/store/useMapFilterStore';

export function MapDrawControl() {
  const map = useMap();
  const { setIsDrawing, setDrawGeometry, setIsCreatePropertyOpen } =
    useMapFilterStore();

  useEffect(() => {
    if (!map) return;

    // Initialize Geoman
    map.pm.addControls({
      position: 'topleft',
      drawControls: true,
      editControls: false,
      drawPolygon: true,
      drawRectangle: false,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
    });

    map.pm.setGlobalOptions({
      snapDistance: 10,
      pinning: true,
    });

    // Handle create event
    map.on('pm:create', (e: any) => {
      const { layer } = e;
      const geojson = (layer as any).toGeoJSON();

      // Capture geometry
      setDrawGeometry(geojson.geometry);

      // Open property form
      setIsCreatePropertyOpen(true);

      // Stop drawing mode
      map.pm.disableDraw();

      // Remove the temporary layer (it will be rendered from the store/database later)
      layer.remove();
    });

    // Sync drawing state with store
    map.on('pm:drawstart', () => setIsDrawing(true));
    map.on('pm:drawend', () => setIsDrawing(false));

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
      map.off('pm:drawstart');
      map.off('pm:drawend');
    };
  }, [map, setDrawGeometry, setIsCreatePropertyOpen, setIsDrawing]);

  return null;
}
