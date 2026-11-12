export type PropertyListItem = {
  id: string;
  cadNumber: string | null;
  propertyKind: string | null;
  houseNumber: string | null;
  newAddress: string | null;
  streetId: string | null;
  mahallaId: string | null;
  geometry: unknown;
  mahalla: { name: string } | null;
  street: { name: string; type: string } | null;
};

export type PropertyDetail = {
  id: string;
  cadNumber: string | null;
  houseNumber: string | null;
  newAddress: string | null;
  streetId: string | null;
  districtId: string;
  mahalla: { id: string; name: string } | null;
  street: { id: string; name: string; type: string } | null;
};
