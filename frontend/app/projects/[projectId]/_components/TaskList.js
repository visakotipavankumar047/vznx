'use client';

import { Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';

export default function TaskList({ tasks, loading, onToggleTask, onDeleteTask }) {
  if (loading) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">No tasks yet. Add your first task below!</p>
      </div>
    );
  }

  return (
    <div className="px-2 divide-y">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="group flex items-center justify-between gap-x-3 p-4"
        >
          <div className="flex items-center gap-x-4 flex-1">
            <button
              onClick={() => onToggleTask(task._id, task.status)}
              className="flex-shrink-0"
            >
              {task.status === 'Complete' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <div className="flex-1">
              <p className={`text-base font-medium ${
                task.status === 'Complete' 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </p>
              {task.assignee && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Assigned to: {task.assignee.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task._id)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}