'use client';

import { useEffect, useRef } from 'react';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import { useSession } from '@/lib/auth/auth-client';
import { UserRole } from '@/lib/generated/prisma/enums';
import { useMapFilterStore } from '@/store/useMapFilterStore';
import { District, Region } from '@/types';

interface UseMapAuthSyncProps {
  regions: Region[];
  districts: District[];
  mapBounds: LatLngBounds | null;
  setMapBounds: (bounds: LatLngBounds | null) => void;
}

/**
 * Handles synchronization between the user's session and the map state.
 * 1. Sets initial region/district filters based on role.
 * 2. Auto-zooms to the relevant area once geometric data is loaded.
 */
export function useMapAuthSync({
  regions,
  districts,
  mapBounds,
  setMapBounds,
}: UseMapAuthSyncProps) {
  const { data: session } = useSession();
  const {
    selectedRegion,
    setSelectedRegion,
    selectedDistrict,
    setSelectedDistrict,
  } = useMapFilterStore();

  // Track if we've already performed the initial zoom to avoid repetitive zooming
  const didInitialZoom = useRef(false);

  // 1. Initialize selection filters based on session
  useEffect(() => {
    if (!session?.user) return;

    const user = session.user;
    const isDistrictUser = user.role === UserRole.district_user;
    const isRegionUser = user.role === UserRole.region_user;

    if ((isRegionUser || isDistrictUser) && user.regionId) {
      setSelectedRegion(user.regionId);
    }
    if (isDistrictUser && user.districtId) {
      setSelectedDistrict(user.districtId);
    }
  }, [session, setSelectedRegion, setSelectedDistrict]);

  // 2. Auto-zoom to restricted area once data (districts/regions) is loaded
  useEffect(() => {
    if (!session?.user || mapBounds || didInitialZoom.current) return;

    const user = session.user;
    const isDistrictUser = user.role === UserRole.district_user;
    const isRegionUser = user.role === UserRole.region_user;

    if (isDistrictUser && user.districtId && districts.length > 0) {
      const district = districts.find((d) => d.id === user.districtId);
      if (district?.geometry) {
        const layer = L.geoJSON(district.geometry as any);
        setMapBounds(layer.getBounds());
        didInitialZoom.current = true;
      }
    } else if (
      isRegionUser &&
      user.regionId &&
      regions.length > 0 &&
      !selectedDistrict
    ) {
      const region = regions.find((r) => r.id === user.regionId);
      if (region?.geometry) {
        const layer = L.geoJSON(region.geometry as any);
        setMapBounds(layer.getBounds());
        didInitialZoom.current = true;
      }
    }
  }, [session, districts, regions, mapBounds, selectedDistrict, setMapBounds]);
}
