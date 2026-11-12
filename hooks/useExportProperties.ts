import { useState } from 'react';
import { fetchProperties, fetchReservedNumbers } from '@/services';

export function useExportProperties() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async (districtId: string, mahallaId?: string) => {
    setIsExporting(true);
    try {
      const [properties, reserved] = await Promise.all([
        fetchProperties(districtId, mahallaId),
        fetchReservedNumbers(districtId),
      ]);
      const XLSX = await import('xlsx');

      const rows = properties.map((property) => ({
        'Kadastr raqami': property.cadNumber ?? '',
        'Mulk turi': property.propertyKind ?? '',
        Mahalla: property.mahalla?.name ?? '',
        "Ko'cha": property.street
          ? `${property.street.name} ${property.street.type.charAt(0).toLowerCase()}${property.street.type.slice(1)}`
          : '',
        'Uy raqami': property.houseNumber ?? '',
        'Yangi manzil': property.newAddress ?? '',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Binolar');

      // Reserved numbers belong to streets, so this sheet always covers the whole district.
      if (reserved.length) {
        const reservedRows = reserved.map((r) => ({
          "Ko'cha": `${r.street.name} ${r.street.type.charAt(0).toLowerCase()}${r.street.type.slice(1)}`,
          'Zaxira raqam': r.houseNumber,
          Sana: new Date(r.createdAt).toLocaleDateString('uz-UZ'),
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reservedRows), 'Zaxira');
      }
      XLSX.writeFile(wb, `binolar_${Date.now()}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting };
}
