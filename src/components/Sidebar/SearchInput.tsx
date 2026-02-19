'use client';

import { useMapStore } from '@/store/mapStore';

export function SearchInput() {
  const setSearchQuery = useMapStore((s) => s.setSearchQuery);

  return (
    <div className="search">
      <input
        type="text"
        placeholder="> search routes..."
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
