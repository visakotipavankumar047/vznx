'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Trash2, User, List, LayoutGrid, Edit } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PageWrapper from '@/components/PageWrapper';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assigneeId: '',
    status: 'Pending',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsData, membersData] = await Promise.all([
        api.getProjects(),
        api.getTeamMembers(),
      ]);
      setProjects(projectsData);
      setTeamMembers(membersData);

      const allTasks = [];
      for (const project of projectsData) {
        const projectTasks = await api.getTasks(project._id);
        allTasks.push(...projectTasks.map(task => ({ ...task, projectName: project.name })));
      }
      setTasks(allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Failed to fetch data', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.project) {
      toast.error('Title and project are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTask(formData);
      toast.success('Task created successfully');
      setIsCreateModalOpen(false);
      setFormData({ title: '', project: '', assigneeId: '', status: 'Pending' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateTask(editingTask._id, formData);
      toast.success('Task updated successfully');
      setIsEditModalOpen(false);
      setEditingTask(null);
      setFormData({ title: '', project: '', assigneeId: '', status: 'Pending' });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      project: task.project,
      assigneeId: task.assignee?._id || '',
      status: task.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      toast.success('Task deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      await api.toggleTaskStatus(task._id, task.status);
      fetchData();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Complete');

  return (
    <DashboardLayout>
      <PageWrapper>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Create and assign tasks to team members
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}>
                {viewMode === 'list' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>

          {viewMode === 'board' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Pending</h3>
                  <Badge variant="warning">{pendingTasks.length}</Badge>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">In Progress</h3>
                  <Badge variant="default">{inProgressTasks.length}</Badge>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Completed</h3>
                  <Badge variant="success">{completedTasks.length}</Badge>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">All Tasks</h3>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">No tasks yet. Create your first task!</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Task</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Project</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Assigned To</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Created</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-3 px-4">
                              <Badge variant={
                                task.status === 'Complete' ? 'success' :
                                task.status === 'In Progress' ? 'warning' : 'default'
                              }>
                                {task.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <p className={`font-medium ${task.status === 'Complete' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <Link href={`/projects/${task.project}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                {task.projectName}
                              </Link>
                            </td>
                            <td className="py-3 px-4">
                              {task.assignee ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{task.assignee.name}</p>
                                    <p className="text-xs text-gray-500">{task.assignee.role}</p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(task)}>
                                  {task.status === 'Complete' ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : task.status === 'In Progress' ? (
                                    <Clock className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEditModal(task)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(task._id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <Modal isOpen={isCreateModalOpen} onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ title: '', project: '', assigneeId: '', status: 'Pending' });
        }} title="Create New Task">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project *
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign To
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={isEditModalOpen} onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
          setFormData({ title: '', project: '', assigneeId: '', status: 'Pending' });
        }} title="Edit Task">
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign To
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Updating...' : 'Update Task'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setEditingTask(null);
                setFormData({ title: '', project: '', assigneeId: '', status: 'Pending' });
              }} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </PageWrapper>
    </DashboardLayout>
  );
}
