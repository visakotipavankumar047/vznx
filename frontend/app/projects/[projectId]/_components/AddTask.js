'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';

export default function AddTask({ onAddTask }) {
  const [taskText, setTaskText] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText, assigneeId || null);
      setTaskText('');
      setAssigneeId('');
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setShowForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add a new task...
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t space-y-3">
      <Input
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Task title..."
        autoFocus
      />
      <select
        value={assigneeId}
        onChange={(e) => setAssigneeId(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Unassigned</option>
        {teamMembers.map((member) => (
          <option key={member._id} value={member._id}>
            {member.name} - {member.role}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Add Task</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
