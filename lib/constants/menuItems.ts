import { Map, LayoutDashboard, MapPin, Users, History, BarChart3 } from 'lucide-react';

export const menuItems = [
  { title: 'Ochiq xarita', icon: Map, href: '/', minRole: null },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    minRole: 'admin',
  },
  {
    title: 'Manzil tuzilmasi',
    icon: MapPin,
    href: '/address-data',
    minRole: null,
  },
  { title: 'Foydalanuvchilar', icon: Users, href: '/users', minRole: 'region_user' },
  { title: 'Seanslar tarixi', icon: History, href: '/sessions', minRole: 'superadmin' },
  { title: 'Hisobotlar', icon: BarChart3, href: '/reports', minRole: null },
];
