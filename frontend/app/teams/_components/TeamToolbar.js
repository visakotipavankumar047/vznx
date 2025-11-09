'use client';

import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/Button';

export default function TeamToolbar() {
  return (
    <div className="flex flex-wrap gap-3 p-4">
      <Button variant="outline">
        Sort by: Name
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      <Button variant="outline">
        Filter by: Role
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      <Button variant="outline">
        Filter by: Project
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}