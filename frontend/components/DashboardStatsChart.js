import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardStatsChart({ stats, selectedMetric, loading }) {
  const data = [
    {
      key: 'totalProjects',
      label: 'Total Projects',
      value: stats.totalProjects || 0,
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      value: stats.inProgress || 0,
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed || 0,
    },
    {
      key: 'teamMembers',
      label: 'Team Members',
      value: stats.teamMembers || 0,
    },
  ];

  const hasData = data.some((item) => item.value > 0);

  const metricColors = {
    totalProjects: '#3b82f6',
    inProgress: '#f97316',
    completed: '#22c55e',
    teamMembers: '#a855f7',
  };

  const activeColor = metricColors[selectedMetric] || '#6366f1';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          </div>
        ) : !hasData ? (
          <p className="text-center text-gray-500 py-8 text-sm">No data yet</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeColor} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={activeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: activeColor, strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid #374151',
                    borderRadius: '0.75rem',
                    color: '#e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={activeColor}
                  strokeWidth={2}
                  fill="url(#metricGradient)"
                  isAnimationActive
                  dot={(props) => {
                    const index = props.index ?? 0;
                    const isSelected = data[index]?.key === selectedMetric;
                    return (
                      <circle
                        key={index}
                        cx={props.cx}
                        cy={props.cy}
                        r={isSelected ? 6 : 3}
                        fill={isSelected ? activeColor : 'rgba(156, 163, 175, 0.9)'}
                        stroke="#111827"
                        strokeWidth={isSelected ? 2 : 1}
                      />
                    );
                  }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
