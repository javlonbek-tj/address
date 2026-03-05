export const PROPERTY_TYPES = {
  RESIDENTIAL: 'residential',
  NON_RESIDENTIAL: 'non-residential',
} as const;

export const PROPERTY_TYPE_LABELS = {
  [PROPERTY_TYPES.RESIDENTIAL]: 'Turar joy',
  [PROPERTY_TYPES.NON_RESIDENTIAL]: 'Noturar joy',
} as const;

export const PROPERTY_TYPE_OPTIONS = [
  {
    name: PROPERTY_TYPE_LABELS[PROPERTY_TYPES.RESIDENTIAL],
    id: PROPERTY_TYPES.RESIDENTIAL,
  },
  {
    name: PROPERTY_TYPE_LABELS[PROPERTY_TYPES.NON_RESIDENTIAL],
    id: PROPERTY_TYPES.NON_RESIDENTIAL,
  },
];

export const IS_NEW_OPTIONS = [
  { name: 'Yangi', id: 'true' },
  { name: 'Eski', id: 'false' },
];
