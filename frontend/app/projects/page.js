'use client';

import { useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectHeader from './_components/ProjectHeader';
import ProjectToolbar from './_components/ProjectToolbar';
import ProjectTable from './_components/ProjectTable';
import PageWrapper from '@/components/PageWrapper';
import { Modal } from '@/components/Modal';
import { ProjectForm } from '@/components/ProjectForm';
import Analytics from '../_components/Analytics';

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjects, createProject, updateProject, updateProgress, deleteProject } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
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
      await updateProject(editingProject._id, data);
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgressUpdate = async (id, progress) => {
    await updateProgress(id, progress);
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout showHeader={false}>
      <PageWrapper>
        <div className="flex w-full flex-col gap-6">
          <ProjectHeader onAddProject={handleAddProject} />
          <section className="flex flex-col w-full gap-4">
            <ProjectToolbar />
            <ProjectTable 
              projects={projects} 
              loading={loading}
              error={error}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onProgressUpdate={handleProgressUpdate}
            />
          </section>

          <Analytics />
        </div>

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Project"
        >
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProject(null);
          }}
          title="Edit Project"
        >
          <ProjectForm
            initialData={editingProject}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingProject(null);
            }}
            isSubmitting={isSubmitting}
          />
        </Modal>
      </PageWrapper>
    </DashboardLayout>
  );
}