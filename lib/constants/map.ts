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
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
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
    fillColor: '#6b7280',
    fillOpacity: 0.4,
    color: '#374151',
    weight: 1,
    opacity: 0.8,
  },
  propertyDone: {
    fillColor: '#22c55e',
    fillOpacity: 0.5,
    color: '#15803d',
    weight: 1,
    opacity: 0.9,
  },
  propertyCandidate: {
    fillColor: '#f59e0b',
    fillOpacity: 0.6,
    color: '#b45309',
    weight: 2,
    opacity: 1,
  },
  propertyAssigned: {
    fillColor: '#ea580c',
    fillOpacity: 0.75,
    color: '#9a3412',
    weight: 2,
    opacity: 1,
  },
  highlight: {
    adminBoundary: BLUE_HIGHLIGHT_STYLE,
    mahalla: BLUE_HIGHLIGHT_STYLE,
    property: {
      fillColor: '#3b82f6',
      fillOpacity: 0.5,
      color: '#1d4ed8',
      weight: 2,
      opacity: 1,
    },
    street: {
      color: '#1d4ed8',
      weight: 6,
      opacity: 1,
      lineCap: 'round' as CanvasLineCap,
      lineJoin: 'round' as CanvasLineJoin,
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

// Properties within this distance of the street are numbering candidates (Task.md §4.2).
export const NUMBERING_BUFFER_METERS = 50;

export function getPropertyStyle(props: {
  done: boolean;
  candidate: boolean;
  assignedNumber: string | null;
}) {
  if (props.assignedNumber !== null) return MAP_LEVEL_STYLES.propertyAssigned;
  if (props.candidate) return MAP_LEVEL_STYLES.propertyCandidate;
  return props.done ? MAP_LEVEL_STYLES.propertyDone : MAP_LEVEL_STYLES.property;
}

export const ZOOM_THRESHOLDS = {
  PROPERTY: 15,
  STREET: 14,
  MAHALLA: 12,
  DISTRICT: 9,
  REGION: 7,
} as const;
