'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticProject = { _id: tempId, ...projectData, createdAt: new Date().toISOString() };
    
    setProjects((prev) => [optimisticProject, ...prev]);
    
    try {
      const created = await api.createProject(projectData);
      setProjects((prev) => prev.map((p) => (p._id === tempId ? created : p)));
      toast.success('Project created successfully');
      return created;
    } catch (err) {
      setProjects((prev) => prev.filter((p) => p._id !== tempId));
      toast.error('Failed to create project');
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    const previousProjects = [...projects];
    
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...projectData } : p)));
    
    try {
      const updated = await api.updateProject(id, projectData);
      setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
      toast.success('Project updated successfully');
      return updated;
    } catch (err) {
      setProjects(previousProjects);
      toast.error('Failed to update project');
      throw err;
    }
  }, [projects]);

  const updateProgress = useCallback(async (id, progress) => {
    const previousProjects = [...projects];
    
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, progress } : p)));
    
    try {
      const updated = await api.updateProjectProgress(id, progress);
      setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
      toast.success('Progress updated');
      return updated;
    } catch (err) {
      setProjects(previousProjects);
      toast.error('Failed to update progress');
      throw err;
    }
  }, [projects]);

  const deleteProject = useCallback(async (id) => {
    const previousProjects = [...projects];
    
    setProjects((prev) => prev.filter((p) => p._id !== id));
    
    toast.success('Project deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          setProjects(previousProjects);
          toast.success('Delete cancelled');
        },
      },
      duration: 5000,
    });
    
    try {
      await api.deleteProject(id);
    } catch (err) {
      setProjects(previousProjects);
      toast.error('Failed to delete project');
      throw err;
    }
  }, [projects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    updateProgress,
    deleteProject,
  };
}
