import { TabType } from '@/types';
import { AddButton, TabButton } from './';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddClick: () => void;
}

export function Tabs({ activeTab, onTabChange, onAddClick }: Props) {
  return (
    <div className='border-b border-gray-200 dark:border-gray-700 px-6'>
      <nav className='flex items-center space-x-8'>
        <TabButton
          active={activeTab === 'regions'}
          onClick={() => onTabChange('regions')}
        >
          Hududlar
        </TabButton>
        <TabButton
          active={activeTab === 'districts'}
          onClick={() => onTabChange('districts')}
        >
          Tumanlar
        </TabButton>
        <TabButton
          active={activeTab === 'mahallas'}
          onClick={() => onTabChange('mahallas')}
        >
          Mahallalar
        </TabButton>
        <TabButton
          active={activeTab === 'streets'}
          onClick={() => onTabChange('streets')}
        >
          Ko&apos;chalar
        </TabButton>
        <AddButton activeTab={activeTab} onClick={onAddClick} />
      </nav>
    </div>
  );
}
