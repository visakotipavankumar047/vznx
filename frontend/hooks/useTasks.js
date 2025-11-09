'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(projectId);
      setTasks(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createTask = useCallback(async (taskData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { _id: tempId, ...taskData, project: projectId, createdAt: new Date().toISOString() };
    
    setTasks((prev) => [...prev, optimisticTask]);
    
    try {
      const created = await api.createTask({ ...taskData, project: projectId });
      setTasks((prev) => prev.map((t) => (t._id === tempId ? created : t)));
      toast.success('Task created successfully');
      return created;
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      toast.error('Failed to create task');
      throw err;
    }
  }, [projectId]);

  const toggleTaskStatus = useCallback(async (taskId, currentStatus) => {
    const previousTasks = [...tasks];
    const newStatus = currentStatus === 'Complete' ? 'Pending' : 'Complete';
    
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
    
    try {
      await api.toggleTaskStatus(taskId, newStatus);
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (err) {
      setTasks(previousTasks);
      toast.error('Failed to update task');
      throw err;
    }
  }, [tasks]);

  const updateTask = useCallback(async (taskId, taskData) => {
    const previousTasks = [...tasks];
    
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...taskData } : t)));
    
    try {
      const updated = await api.updateTask(taskId, taskData);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      toast.success('Task updated successfully');
      return updated;
    } catch (err) {
      setTasks(previousTasks);
      toast.error('Failed to update task');
      throw err;
    }
  }, [tasks]);

  const deleteTask = useCallback(async (taskId) => {
    const previousTasks = [...tasks];
    
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    
    toast.success('Task deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          setTasks(previousTasks);
          toast.success('Delete cancelled');
        },
      },
      duration: 5000,
    });
    
    try {
      await api.deleteTask(taskId);
    } catch (err) {
      setTasks(previousTasks);
      toast.error('Failed to delete task');
      throw err;
    }
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    toggleTaskStatus,
    updateTask,
    deleteTask,
  };
}
