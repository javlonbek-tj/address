export type User = {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  status: string;
  position: string;
  region: {
    id: string;
    name: string;
  };
  district: {
    id: string;
    name: string;
  };
};
