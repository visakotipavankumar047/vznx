'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/Button';

export default function TeamHeader({ onAddMember }) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Team Workload
        </h1>
        <p className="text-muted-foreground text-lg">An at-a-glance overview of your team&apos;s capacity.</p>
      </div>
      <Button onClick={onAddMember} className="shadow-lg hover:shadow-xl transition-shadow">
        <Plus className="mr-2 h-4 w-4" />
        Add Member
      </Button>
    </div>
  );
}
