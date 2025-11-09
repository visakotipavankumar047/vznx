'use client';

import { useState, useEffect, use } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import DashboardLayout from '@/components/DashboardLayout';
import ProjectDetailsHeader from './_components/ProjectDetailsHeader';
import TaskList from './_components/TaskList';
import AddTask from './_components/AddTask';
import PageWrapper from '@/components/PageWrapper';
import { api } from '@/lib/api';

export default function ProjectDetailsPage({ params }) {
  const { projectId } = use(params);
  const [project, setProject] = useState(null);
  const { tasks, loading, fetchTasks, createTask, toggleTaskStatus, deleteTask } = useTasks(projectId);
  const { updateProgress } = useProjects();

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await api.getProjects();
        const foundProject = data.find(p => p._id === projectId);
        setProject(foundProject);
      } catch (err) {
        console.error('Failed to load project', err);
      }
    };
    loadProject();
    fetchTasks();
  }, [projectId, fetchTasks]);

  useEffect(() => {
    // Auto-update project progress when all tasks are complete
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(t => t.status === 'Complete').length;
      const newProgress = Math.round((completedTasks / tasks.length) * 100);
      if (project && newProgress !== project.progress) {
        updateProgress(projectId, newProgress);
        setProject(prev => ({ ...prev, progress: newProgress }));
      }
    }
  }, [tasks, projectId, updateProgress, project]);

  const handleAddTask = async (taskText, assigneeId) => {
    await createTask({ title: taskText, status: 'Pending', assigneeId });
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    await toggleTaskStatus(taskId, currentStatus);
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
  };

  if (!project) {
    return (
      <DashboardLayout showHeader={false}>
        <PageWrapper>
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading project...</p>
          </div>
        </PageWrapper>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showHeader={false}>
      <PageWrapper>
        <div className="layout-content-container flex w-full max-w-4xl flex-col flex-1 mx-auto">
          <ProjectDetailsHeader project={project} />
          <div className="bg-card rounded-xl border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Tasks</h3>
              <span className="text-sm text-gray-500">
                {tasks.filter(t => t.status === 'Complete').length}/{tasks.length} completed
              </span>
            </div>
            <TaskList 
              tasks={tasks} 
              loading={loading}
              onToggleTask={handleToggleTask} 
              onDeleteTask={handleDeleteTask}
            />
            <AddTask onAddTask={handleAddTask} />
          </div>
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}