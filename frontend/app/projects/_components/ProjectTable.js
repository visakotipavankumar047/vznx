'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Progress } from '@/components/Progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/Table';

const statusColors = {
  Completed: 'success',
  'In Progress': 'default',
  'At Risk': 'warning',
  Planned: 'default',
};

export default function ProjectTable({ projects, loading, error, onEdit, onDelete, onProgressUpdate }) {
  const [editingProgress, setEditingProgress] = useState(null);
  const [progressValue, setProgressValue] = useState(0);

  const handleProgressClick = (project) => {
    setEditingProgress(project._id);
    setProgressValue(project.progress);
  };

  const handleProgressSave = async (projectId) => {
    await onProgressUpdate(projectId, progressValue);
    setEditingProgress(null);
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card p-12 text-center">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card p-12 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No projects yet. Create your first project!</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Project Lead</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project._id}>
              <TableCell className="font-medium">
                <Link href={`/projects/${project._id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {project.name}
                </Link>
                {project.taskSummary && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.taskSummary.completed}/{project.taskSummary.total} tasks completed
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusColors[project.status]}>{project.status}</Badge>
              </TableCell>
              <TableCell>
                {project.projectLead && typeof project.projectLead === 'object' && project.projectLead.name ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {project.projectLead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{project.projectLead.name}</p>
                      <p className="text-xs text-gray-500">{project.projectLead.role}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">No lead</span>
                )}
              </TableCell>
              <TableCell>
                {editingProgress === project._id ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progressValue}
                        onChange={(e) => setProgressValue(Number(e.target.value))}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                      <Button size="sm" onClick={() => handleProgressSave(project._id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingProgress(null)}>Cancel</Button>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressValue}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="cursor-pointer" onClick={() => handleProgressClick(project)}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-muted-foreground text-sm">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(project._id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}