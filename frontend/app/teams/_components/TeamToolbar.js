'use client';

import { Button } from '@/components/Button';
import { ROLE_GROUPS } from '@/lib/roleCategories';

export default function TeamToolbar({ activeCategory, onCategoryChange, categoryCounts }) {
  const allCount = categoryCounts?.get('All') ?? 0;

  return (
    <div className="flex flex-wrap gap-3 p-4 items-center justify-between">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === 'All' ? 'default' : 'outline'}
          onClick={() => onCategoryChange('All')}
        >
          All
          <span className="ml-2 text-xs opacity-80">{allCount}</span>
        </Button>
        {ROLE_GROUPS.map((group) => {
          const count = categoryCounts?.get(group.label) ?? 0;
          return (
            <Button
              key={group.label}
              variant={activeCategory === group.label ? 'default' : 'outline'}
              onClick={() => onCategoryChange(group.label)}
            >
              {group.label}
              <span className="ml-2 text-xs opacity-80">{count}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}