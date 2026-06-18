import { useState } from 'react';
import { fetchStreetsForExport } from '@/services';

export function useExportStreets() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async (
    filters: {
      search: string;
      regionId: string;
      districtId: string;
      mahallaId: string;
      streetType: string;
      uzKadFilter: string;
    },
    isRegionLocked: boolean,
    isDistrictLocked: boolean,
  ) => {
    setIsExporting(true);
    try {
      const streets = await fetchStreetsForExport(
        filters.search,
        filters.regionId,
        filters.districtId,
        filters.mahallaId,
        filters.streetType,
        filters.uzKadFilter,
      );

      const XLSX = await import('xlsx');

      const rows = streets.map((street) => ({
        ...(!isRegionLocked && !isDistrictLocked
          ? { Viloyat: street.district.region.name }
          : {}),
        ...(!isDistrictLocked ? { Tuman: street.district.name } : {}),
        Nomi: street.name,
        Kodi: street.code,
        'UzKad kodi': street.uzKadCode ?? '',
        "UzKad ko'cha nomi": street.uzKadStreet?.name ?? '',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ko'chalar");
      XLSX.writeFile(wb, `kochalar_${Date.now()}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting };
}
