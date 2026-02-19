'use client';

import { SidebarHeader } from './SidebarHeader';
import { SearchInput } from './SearchInput';
import { FolderList } from './FolderList';
import { OfflineButton } from './OfflineButton';
import { useGlitch } from '@/hooks/useGlitch';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function Sidebar() {
  useGlitch();
  useServiceWorker();

  return (
    <div id="sidebar">
      <SidebarHeader />
      <SearchInput />
      <FolderList />
      <div className="sidebar-footer">
        <OfflineButton />
      </div>
    </div>
  );
}
