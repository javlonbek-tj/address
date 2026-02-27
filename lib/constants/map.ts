// ==============================
// BASEMAP OPTIONS
// ==============================

export const baseMaps = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 17,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    maxZoom: 17,
  },
} as const;

export type BaseMapKey = keyof typeof baseMaps;

const BASE_BLUE_STYLE = {
  fillColor: '#3b82f6',
  weight: 2,
  opacity: 1,
  color: '#1d4ed8',
  fillOpacity: 0,
};

const BLUE_HIGHLIGHT_STYLE = {
  fillColor: '#1d4ed8',
  fillOpacity: 0,
  weight: 4,
  color: '#1d4ed8',
};

export const MAP_LEVEL_STYLES = {
  adminBoundary: BASE_BLUE_STYLE,
  mahalla: BASE_BLUE_STYLE,
  street: {
    color: '#f59e0b',
    weight: 4,
    opacity: 0.9,
    lineCap: 'round' as CanvasLineCap,
    lineJoin: 'round' as CanvasLineJoin,
  },
  property: {
    fillColor: '#6366f1',
    weight: 1,
    opacity: 1,
    color: '#4338ca',
    fillOpacity: 0.5,
  },
  propertyDone: {
    fillColor: '#10b981', // emerald-500
    weight: 2,
    opacity: 1,
    color: '#fbbf24', // amber-400 (yellowish)
    fillOpacity: 0.6,
  },
  highlight: {
    adminBoundary: BLUE_HIGHLIGHT_STYLE,
    mahalla: BLUE_HIGHLIGHT_STYLE,
    street: {
      color: '#1d4ed8',
      weight: 6,
      opacity: 1,
      lineCap: 'round' as CanvasLineCap,
      lineJoin: 'round' as CanvasLineJoin,
    },
    property: {
      fillColor: '#4338ca',
      fillOpacity: 0.7,
      weight: 3,
      color: '#312e81',
    },
    propertyDone: {
      fillColor: '#059669', // emerald-600
      fillOpacity: 0.8,
      weight: 3,
      color: '#f59e0b', // amber-500 (yellowish highlight)
    },
  },
  satellite: {
    mahalla: {
      fillColor: '#ffffff',
      weight: 2,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0,
    },
    district: {
      fillColor: '#3b82f6',
      weight: 3,
      opacity: 1,
      color: '#3b82f6',
      fillOpacity: 0,
    },
    street: {
      color: '#f59e0b',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round' as CanvasLineCap,
      lineJoin: 'round' as CanvasLineJoin,
    },
    highlight: {
      mahalla: {
        fillColor: '#ffffff',
        fillOpacity: 0,
        weight: 6,
        color: '#ffffff',
      },
      district: {
        fillColor: '#60a5fa',
        fillOpacity: 0,
        weight: 6,
        color: '#60a5fa',
      },
      street: {
        color: '#1d4ed8',
        weight: 6,
        opacity: 1,
        lineCap: 'round' as CanvasLineCap,
        lineJoin: 'round' as CanvasLineJoin,
      },
    },
  },
};

export const ZOOM_THRESHOLDS = {
  STREET: 14,
  MAHALLA: 12,
  DISTRICT: 9,
  REGION: 7,
} as const;
