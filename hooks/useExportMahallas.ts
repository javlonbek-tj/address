import { useState } from 'react';
import { fetchMahallaTableData } from '@/services';

export function useExportMahallas() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async (
    filters: {
      search: string;
      regionId: string;
      districtId: string;
      isOptimized: string;
    },
    isRegionLocked: boolean,
    isDistrictLocked: boolean,
  ) => {
    setIsExporting(true);
    try {
      const { data: mahallas } = await fetchMahallaTableData(
        1,
        99999,
        filters.search,
        filters.regionId,
        filters.districtId,
        filters.isOptimized,
      );

      const XLSX = await import('xlsx');

      const sorted = [...mahallas].sort(
        (a, b) =>
          a.district.region.name.localeCompare(b.district.region.name) ||
          a.district.name.localeCompare(b.district.name) ||
          a.name.localeCompare(b.name),
      );

      const rows = sorted.map((mahalla, index) => ({
        'T/R': index + 1,
        ...(!isRegionLocked && !isDistrictLocked
          ? { Viloyat: mahalla.district.region.name }
          : {}),
        ...(!isDistrictLocked ? { Tuman: mahalla.district.name } : {}),
        Nomi: mahalla.name,
        'UzKad nomi': mahalla.uzKadName,
        'Eski nomi': mahalla.oldName ?? '',
        'UzKad kodi': mahalla.code,
        'APU kodi': mahalla.geoCode,
        '1C kodi': mahalla.oneId,
        Optimallashgan: mahalla.isOptimized ? 'Ha' : "Yo'q",
        'Qaysi mahallaga qoʻshilgan': mahalla.mergedInto
          .map((target) => `${target.name} (${target.code})`)
          .join(', '),
        'Qoʻshilgan mahallalar': mahalla.mergedMahallas
          .map((source) => `${source.name} (${source.code})`)
          .join(', '),
        Qaror: mahalla.regulation ?? '',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mahallalar');
      XLSX.writeFile(wb, `mahallalar_${Date.now()}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting };
}
