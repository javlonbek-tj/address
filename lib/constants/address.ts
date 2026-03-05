export const STREET_TYPES = {
  STREET: "Ko'cha",
  LANE: "Tor ko'cha",
  DEAD_END: "Berk ko'cha",
  AVENUE: "Shoh ko'cha",
} as const;

export const STREET_TYPE_OPTIONS = [
  { id: STREET_TYPES.STREET, name: STREET_TYPES.STREET },
  { id: STREET_TYPES.LANE, name: STREET_TYPES.LANE },
  { id: STREET_TYPES.DEAD_END, name: STREET_TYPES.DEAD_END },
  { id: STREET_TYPES.AVENUE, name: STREET_TYPES.AVENUE },
];

export const MAHALLA_OPTIMIZATION_OPTIONS = [
  { id: 'true', name: 'Optimallashgan' },
  { id: 'false', name: 'Optimallashmagan' },
];
