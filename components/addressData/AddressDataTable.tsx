'use client';

import {
  Tabs,
  RegionFormDialog,
  DistrictFormDialog,
  MahallaFormDialog,
  StreetFormDialog,
} from './';
import { useState } from 'react';
import { District, Region, TabType } from '@/types';
import { useTableActions } from '@/hooks';
import { DataTable } from './DataTable';

interface Props {
  regions: Region[];
  districts: District[];
  mahallas: Mahalla[];
  streets: Street[];
}

export function AddressDataTable({
  regions,
  districts,
  mahallas,
  streets,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('regions');
  const { isFormOpen, handleCloseForm, editingItem, handleEdit, setDeleteId } =
    useTableActions();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className='p-6'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className='overflow-x-auto p-6'>
          {activeTab === 'regions' && (
            <DataTable
              data={regions}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              activeTab='regions'
            />
          )}

          {activeTab === 'districts' && (
            <DataTable
              data={districts}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              activeTab='districts'
            />
          )}
        </div>
      </div>
      <RegionFormDialog
        open={isFormOpen && activeTab === 'regions'}
        onClose={handleCloseForm}
        region={editingItem as Region}
      />
      <DistrictFormDialog
        open={isFormOpen && activeTab === 'districts'}
        onClose={handleCloseForm}
        district={editingItem as District}
        regions={regions}
      />
      <MahallaFormDialog
        open={isFormOpen && activeTab === 'mahallas'}
        onClose={handleCloseForm}
        mahalla={editingItem as Mahalla}
      />
      <StreetFormDialog
        open={isFormOpen && activeTab === 'streets'}
        onClose={handleCloseForm}
        street={editingItem as Street}
      />
    </div>
  );
}
