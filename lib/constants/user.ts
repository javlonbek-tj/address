export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  REGION_USER: 'region_user',
  DISTRICT_USER: 'district_user',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPERADMIN]: 'Superadmin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.REGION_USER]: 'Viloyat xodimi',
  [USER_ROLES.DISTRICT_USER]: 'Tuman xodimi',
} as const;

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUSES.ACTIVE]: 'Faol',
  [USER_STATUSES.INACTIVE]: 'Nofaol',
} as const;

export const USER_ROLE_OPTIONS = [
  { name: USER_ROLE_LABELS[USER_ROLES.SUPERADMIN], id: USER_ROLES.SUPERADMIN },
  { name: USER_ROLE_LABELS[USER_ROLES.ADMIN], id: USER_ROLES.ADMIN },
  {
    name: USER_ROLE_LABELS[USER_ROLES.REGION_USER],
    id: USER_ROLES.REGION_USER,
  },
  {
    name: USER_ROLE_LABELS[USER_ROLES.DISTRICT_USER],
    id: USER_ROLES.DISTRICT_USER,
  },
];

export const USER_STATUS_OPTIONS = [
  { name: USER_STATUS_LABELS[USER_STATUSES.ACTIVE], id: USER_STATUSES.ACTIVE },
  {
    name: USER_STATUS_LABELS[USER_STATUSES.INACTIVE],
    id: USER_STATUSES.INACTIVE,
  },
];

export const REGION_USER_POSITIONS = {
  BOSS: 'boss',
  ASSISTANT: 'assistant',
} as const;

export const REGION_USER_POSITION_LABELS = {
  [REGION_USER_POSITIONS.BOSS]: "Sho'ba boshlig'i",
  [REGION_USER_POSITIONS.ASSISTANT]: 'Bosh mutaxassis',
} as const;

export const REGION_USER_POSITION_OPTIONS = [
  {
    name: REGION_USER_POSITION_LABELS[REGION_USER_POSITIONS.BOSS],
    id: REGION_USER_POSITIONS.BOSS,
  },
  {
    name: REGION_USER_POSITION_LABELS[REGION_USER_POSITIONS.ASSISTANT],
    id: REGION_USER_POSITIONS.ASSISTANT,
  },
];
