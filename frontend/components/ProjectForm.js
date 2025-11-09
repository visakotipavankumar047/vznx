'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from './Input';
import { Button } from './Button';
import { api } from '@/lib/api';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  status: z.enum(['Planned', 'In Progress', 'At Risk', 'Completed']),
  progress: z.number().min(0).max(100).or(z.string().transform(Number)),
  studio: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  color: z.string().optional(),
  projectLead: z.string().optional(),
});

export function ProjectForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      status: initialData?.status || 'Planned',
      progress: initialData?.progress || 0,
      studio: initialData?.studio || 'Core Studio',
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      notes: initialData?.notes || '',
      color: initialData?.color || '#2563eb',
      projectLead: (typeof initialData?.projectLead === 'object' ? initialData?.projectLead?._id : initialData?.projectLead) || '',
    },
  });

  const progress = watch('progress');

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await api.getTeamMembers();
        setTeamMembers(members);
      } catch (err) {
        console.error('Failed to load team members', err);
      }
    };
    fetchTeamMembers();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name *
        </label>
        <Input {...register('name')} placeholder="Enter project name" />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status *
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Lead
          </label>
          <select
            {...register('projectLead')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No Lead</option>
            {teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} - {member.role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Progress (%) *
        </label>
        <Input
          {...register('progress', { valueAsNumber: true })}
          type="number"
          min="0"
          max="100"
          placeholder="0"
        />
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Studio
          </label>
          <Input {...register('studio')} placeholder="Core Studio" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <Input {...register('dueDate')} type="date" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          placeholder="Project notes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Color
        </label>
        <Input {...register('color')} type="color" />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
