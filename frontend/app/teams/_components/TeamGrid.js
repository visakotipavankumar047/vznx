'use client';

import { Edit, Trash2, Users, Package } from 'lucide-react';
import { Card } from '@/components/Card';
import { Progress } from '@/components/Progress';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

const MAX_CAPACITY = 5;

function getCapacityColor(taskCount) {
  const percentage = (taskCount / MAX_CAPACITY) * 100;
  if (percentage >= 80) return 'red';
  if (percentage >= 60) return 'orange';
  return 'green';
}

function getCapacityLabel(taskCount) {
  const percentage = (taskCount / MAX_CAPACITY) * 100;
  if (percentage >= 80) return 'High Load';
  if (percentage >= 60) return 'Medium Load';
  return 'Available';
}

export default function TeamGrid({ teamMembers, loading, error, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading team members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No team members yet. Add your first team member!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
      {teamMembers.map((member) => {
        const taskCount = member.tasks?.length || 0;
        const capacityPercentage = (taskCount / MAX_CAPACITY) * 100;
        const capacityColor = getCapacityColor(taskCount);
        const capacityLabel = getCapacityLabel(taskCount);

        return (
          <Card key={member._id} className="flex flex-col gap-4 p-6 relative group">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => onEdit(member)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(member._id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-full h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-lg font-bold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  <Package className="inline h-4 w-4 mr-1" />
                  {taskCount} tasks assigned
                </p>
                <Badge variant={capacityColor === 'green' ? 'success' : capacityColor === 'orange' ? 'warning' : 'default'}>
                  {capacityLabel}
                </Badge>
              </div>
              <div className="mb-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Capacity: {taskCount}/{MAX_CAPACITY} ({Math.round(capacityPercentage)}%)
                </p>
              </div>
              <Progress
                value={capacityPercentage}
                color={capacityColor}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
