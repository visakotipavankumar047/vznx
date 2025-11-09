'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/Button';

export default function ProjectHeader({ onAddProject }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-display tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Projects
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and track all your firm&apos;s projects in one place.
        </p>
      </div>
      <Button onClick={onAddProject} className="shadow-lg hover:shadow-xl transition-shadow">
        <Plus className="mr-2 h-4 w-4" />
        Add New Project
      </Button>
    </header>
  );
}
