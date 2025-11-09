'use client';

import { Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/Button';

export default function ProjectToolbar() {
  return (
    <div className="flex justify-between items-center gap-2 rounded-xl border bg-card px-2 py-1">
      <div className="flex gap-1">
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      <Button variant="ghost" size="icon">
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}