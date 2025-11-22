'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import DashboardLayout from '@/components/DashboardLayout';
import TeamHeader from './_components/TeamHeader';
import TeamToolbar from './_components/TeamToolbar';
import TeamGrid from './_components/TeamGrid';
import PageWrapper from '@/components/PageWrapper';
import { Modal } from '@/components/Modal';
import { TeamMemberForm } from '@/components/TeamMemberForm';
import { ROLE_GROUPS, getRoleCategory } from '@/lib/roleCategories';

export default function TeamPage() {
  const { teamMembers, loading, error, fetchTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    counts.set('All', teamMembers.length);

    ROLE_GROUPS.forEach((group) => {
      counts.set(group.label, 0);
    });

    teamMembers.forEach((member) => {
      const category = getRoleCategory(member.role);
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return counts;
  }, [teamMembers]);

  const filteredMembers = useMemo(() => {
    if (activeCategory === 'All') {
      return teamMembers;
    }
    return teamMembers.filter((member) => getRoleCategory(member.role) === activeCategory);
  }, [teamMembers, activeCategory]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      await createTeamMember(data);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateTeamMember(editingMember._id, data);
      setIsEditModalOpen(false);
      setEditingMember(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteTeamMember(id);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout showHeader={false}>
      <PageWrapper>
        <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 mx-auto">
          <TeamHeader onAddMember={() => setIsCreateModalOpen(true)} />
          <TeamToolbar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categoryCounts={categoryCounts}
          />
          <TeamGrid 
            teamMembers={filteredMembers} 
            loading={loading}
            error={error}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add Team Member"
        >
          <TeamMemberForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMember(null);
          }}
          title="Edit Team Member"
        >
          <TeamMemberForm
            initialData={editingMember}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingMember(null);
            }}
            isSubmitting={isSubmitting}
          />
        </Modal>
      </PageWrapper>
    </DashboardLayout>
  );
}