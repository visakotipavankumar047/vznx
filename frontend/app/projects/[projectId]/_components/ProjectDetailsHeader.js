'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/Button';

export default function ProjectDetailsHeader({ project }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-8">
      <div className="flex flex-wrap gap-2">
        <Link href="/projects" className="text-muted-foreground hover:text-primary">
          All Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{project.name}</span>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex min-w-72 flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            Client: {project.client} | Due: {project.dueDate}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}