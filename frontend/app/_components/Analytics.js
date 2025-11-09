'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function Analytics() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const projects = await api.getProjects();
        const allTasks = [];
        
        for (const project of projects) {
          const projectTasks = await api.getTasks(project._id);
          allTasks.push(...projectTasks.map(task => ({ ...task, projectName: project.name, projectId: project._id })));
        }
        
        setTasks(allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTasks();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No tasks yet</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link key={task._id} href={`/projects/${task.projectId}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 flex-1">
                    {task.status === 'Complete' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : task.status === 'In Progress' ? (
                      <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${task.status === 'Complete' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {task.projectName}
                        {task.assignee && ` • ${task.assignee.name}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={task.status === 'Complete' ? 'success' : task.status === 'In Progress' ? 'warning' : 'default'}>
                    {task.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
