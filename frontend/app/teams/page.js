'use client';

import { useState, useEffect } from 'react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import DashboardLayout from '@/components/DashboardLayout';
import TeamHeader from './_components/TeamHeader';
import TeamToolbar from './_components/TeamToolbar';
import TeamGrid from './_components/TeamGrid';
import PageWrapper from '@/components/PageWrapper';
import { Modal } from '@/components/Modal';
import { TeamMemberForm } from '@/components/TeamMemberForm';

export default function TeamPage() {
  const { teamMembers, loading, error, fetchTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <TeamToolbar />
          <TeamGrid 
            teamMembers={teamMembers} 
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