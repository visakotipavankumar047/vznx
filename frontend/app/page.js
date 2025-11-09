'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Analytics from './_components/Analytics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { Plus, TrendingUp, CheckCircle, Users, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    teamMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, teamMembers] = await Promise.all([
          api.getProjects(),
          api.getTeamMembers(),
        ]);

        const totalTasks = projects.reduce((sum, p) => sum + (p.taskSummary?.total || 0), 0);
        const completedTasks = projects.reduce((sum, p) => sum + (p.taskSummary?.completed || 0), 0);

        setStats({
          totalProjects: projects.length,
          inProgress: projects.filter(p => p.status === 'In Progress').length,
          completed: projects.filter(p => p.status === 'Completed').length,
          teamMembers: teamMembers.length,
          totalTasks,
          completedTasks,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <PageWrapper>
        <div className="flex w-full flex-col gap-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Welcome back! Here&apos;s your studio overview.
              </p>
            </div>
            <Link href="/projects">
              <Button className="shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="mr-2 h-4 w-4" />
                View Projects
              </Button>
            </Link>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderKanban className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{loading ? '...' : stats.totalProjects}</p>
                <p className="text-xs text-muted-foreground mt-1">All projects</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{loading ? '...' : stats.inProgress}</p>
                <p className="text-xs text-muted-foreground mt-1">Active projects</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{loading ? '...' : stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-1">Finished projects</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{loading ? '...' : stats.teamMembers}</p>
                <p className="text-xs text-muted-foreground mt-1">Active members</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Total Tasks</span>
                      <span className="text-sm font-bold">{loading ? '...' : stats.totalTasks}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Completed</span>
                      <span className="text-sm font-bold text-green-600">{loading ? '...' : stats.completedTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/items">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Item
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team Member
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Analytics />
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}
