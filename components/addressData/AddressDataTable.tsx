'use client';

import type { Region } from '@/lib/generated/prisma/client';
import {
  Tabs,
  RegionFormDialog,
  DistrictFormDialog,
  MahallaFormDialog,
  StreetFormDialog,
} from './';
import { useState } from 'react';
import { TabType } from '@/types';
import { useTableActions } from '@/hooks';
import { RegionTable } from './RegionTable';

interface Props {
  regions: Region[];
}

export function AddressDataTable({ regions }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('regions');
  const { handleCreate, isFormOpen, handleCloseForm } = useTableActions();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className='p-6'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
        <Tabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAddClick={handleCreate}
        />
        <div className='overflow-x-auto p-6'>
          <RegionTable regions={regions} />
        </div>
      </div>
      <RegionFormDialog
        open={isFormOpen && activeTab === 'regions'}
        onClose={handleCloseForm}
        isEdit={false}
      />
      <DistrictFormDialog
        open={isFormOpen && activeTab === 'districts'}
        onClose={handleCloseForm}
        isEdit={false}
      />
      <MahallaFormDialog
        open={isFormOpen && activeTab === 'mahallas'}
        onClose={handleCloseForm}
        isEdit={false}
      />
      <StreetFormDialog
        open={isFormOpen && activeTab === 'streets'}
        onClose={handleCloseForm}
        isEdit={false}
      />
    </div>
  );
}
