import { Map, Navigation, Home, Waypoints, Building2 } from 'lucide-react';
import { AnalyticsCardsProps } from './AnalyticsCards';

export const CARDS_DATA = ({ counts }: AnalyticsCardsProps) => [
  {
    title: 'Viloyatlar',
    value: counts.regions,
    icon: Map,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    title: 'Tumanlar',
    value: counts.districts,
    icon: Navigation,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    title: 'Mahallalar',
    value: counts.mahallas,
    icon: Home,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    title: "Ko'chalar",
    value: counts.streets,
    icon: Waypoints,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    title: "Ko'chmas Mulk",
    value: counts.properties,
    icon: Building2,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
];

export const REGION_CHART_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
];

export const STREET_TYPE_CHART_COLORS = [
  '#3b82f6',
  '#60a5fa',
  '#3b82f6',
  '#93c5fd',
  '#2563eb',
  '#1d4ed8',
];

export const DATA_HEALTH_CHART_COLORS = ['#10b981', '#ef4444'];
