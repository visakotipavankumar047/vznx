'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTeamMembers();
      setTeamMembers(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeamMember = useCallback(async (memberData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMember = { _id: tempId, ...memberData, tasks: [], createdAt: new Date().toISOString() };
    
    setTeamMembers((prev) => [...prev, optimisticMember]);
    
    try {
      const created = await api.createTeamMember(memberData);
      setTeamMembers((prev) => prev.map((m) => (m._id === tempId ? created : m)));
      toast.success('Team member added successfully');
      return created;
    } catch (err) {
      setTeamMembers((prev) => prev.filter((m) => m._id !== tempId));
      toast.error('Failed to add team member');
      throw err;
    }
  }, []);

  const updateTeamMember = useCallback(async (id, memberData) => {
    const previousMembers = [...teamMembers];
    
    setTeamMembers((prev) => prev.map((m) => (m._id === id ? { ...m, ...memberData } : m)));
    
    try {
      const updated = await api.updateTeamMember(id, memberData);
      setTeamMembers((prev) => prev.map((m) => (m._id === id ? updated : m)));
      toast.success('Team member updated successfully');
      return updated;
    } catch (err) {
      setTeamMembers(previousMembers);
      toast.error('Failed to update team member');
      throw err;
    }
  }, [teamMembers]);

  const deleteTeamMember = useCallback(async (id) => {
    const previousMembers = [...teamMembers];
    
    setTeamMembers((prev) => prev.filter((m) => m._id !== id));
    
    toast.success('Team member removed', {
      action: {
        label: 'Undo',
        onClick: () => {
          setTeamMembers(previousMembers);
          toast.success('Delete cancelled');
        },
      },
      duration: 5000,
    });
    
    try {
      await api.deleteTeamMember(id);
    } catch (err) {
      setTeamMembers(previousMembers);
      toast.error('Failed to remove team member');
      throw err;
    }
  }, [teamMembers]);

  return {
    teamMembers,
    loading,
    error,
    fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };
}
