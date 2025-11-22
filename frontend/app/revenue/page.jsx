'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, PiggyBank, TrendingDown, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import PageWrapper from '@/components/PageWrapper';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeTrends = (entries) =>
    entries
        .map((entry) => ({
            ...entry,
            timestamp: entry.timestamp || new Date(entry.date || entry.createdAt).getTime(),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

const splitTrendData = (entries) => {
    const cutoff = Date.now() - DAY_MS;
    const historical = [];
    const pending = [];
    entries.forEach((entry) => {
        if (entry.timestamp <= cutoff) {
            historical.push(entry);
        } else {
            pending.push(entry);
        }
    });
    return { historical, pending };
};

const calculateRangeChange = (entries, days) => {
    if (!entries.length) {
        return { change: 0, percent: 0 };
    }
    const latest = entries[entries.length - 1];
    const cutoff = latest.timestamp - days * DAY_MS;
    let reference = entries[0];
    for (let i = entries.length - 1; i >= 0; i -= 1) {
        if (entries[i].timestamp <= cutoff) {
            reference = entries[i];
            break;
        }
    }
    const base = reference?.revenue ?? latest.revenue;
    const change = latest.revenue - base;
    const percent = base ? (change / base) * 100 : 0;
    return { change, percent };
};

export default function RevenuePage() {
    const [profitData, setProfitData] = useState(null);
    const [historicalTrendData, setHistoricalTrendData] = useState([]);
    const [pendingTrendData, setPendingTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('30');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [profit, trends] = await Promise.all([
                api.getProfitAnalysis(),
                api.getRevenueTrends(timeRange),
            ]);

            setProfitData(profit);
            const normalized = normalizeTrends(trends);
            const { historical, pending } = splitTrendData(normalized);
            setHistoricalTrendData(historical);
            setPendingTrendData(pending);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch revenue data:', err);
            setError('Failed to load revenue data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatSignedCurrency = (value) => {
        const sign = value >= 0 ? '+' : '-';
        return `${sign}${formatCurrency(Math.abs(value))}`;
    };

    const formatPercentage = (value) => {
        if (!Number.isFinite(value)) {
            return '0%';
        }
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const change1Day = useMemo(() => calculateRangeChange(historicalTrendData, 1), [historicalTrendData]);
    const change7Day = useMemo(() => calculateRangeChange(historicalTrendData, 7), [historicalTrendData]);
    const rangeOptions = ['1', '7', '30', '90', '365'];
    const rangeLabels = {
        '1': '1D',
        '7': '7D',
        '30': '1M',
        '90': '3M',
        '365': '1Y',
    };

    const overall = profitData?.overall || {};
    const projects = profitData?.projects || [];

    const budgetBreakdownData = projects.reduce(
        (acc, p) => {
            const breakdown = p.budgetBreakdown || {};
            return {
                labor: acc.labor + (breakdown.labor || 0),
                materials: acc.materials + (breakdown.materials || 0),
                overhead: acc.overhead + (breakdown.overhead || 0),
            };
        },
        { labor: 0, materials: 0, overhead: 0 }
    );

    const pieChartData = [
        { name: 'Labor', value: budgetBreakdownData.labor },
        { name: 'Materials', value: budgetBreakdownData.materials },
        { name: 'Overhead', value: budgetBreakdownData.overhead },
    ].filter((item) => item.value > 0);

    const showLoading = loading && !profitData;
    const showError = error && !profitData;

    return (
        <DashboardLayout>
            <PageWrapper>
                {showLoading ? (
                    <div className="p-6">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500 dark:text-gray-400">Loading revenue data...</div>
                        </div>
                    </div>
                ) : showError ? (
                    <div className="p-6">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                            <button
                                onClick={fetchData}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(overall.totalRevenue || 0)}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                        <PiggyBank className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(overall.totalBudget || 0)}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 ${overall.totalProfit >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} rounded-lg`}>
                                        {overall.totalProfit >= 0 ? (
                                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Profit</span>
                                </div>
                                <p className={`text-2xl font-bold ${overall.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(overall.totalProfit || 0)}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{overall.margin || 0}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[{ label: '1 Day Change', data: change1Day }, { label: '7 Day Change', data: change7Day }].map(({ label, data }) => (
                                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                                        <span className={`text-lg font-semibold ${data.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {formatSignedCurrency(data.change)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatPercentage(data.percent)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trends (Stock View)</h2>
                                    {loading && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}
                                </div>
                                {historicalTrendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={historicalTrendData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#6b7280" style={{ fontSize: '12px' }} />
                                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} stroke="#6b7280" style={{ fontSize: '12px' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                }}
                                                labelFormatter={(label) => formatDate(label)}
                                                formatter={(value) => [formatCurrency(value), 'Revenue']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#2563eb"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                                animationDuration={1000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[350px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                        Waiting for 24-hour revenue snapshots.
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Allocation</h2>
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                label={(entry) => entry.name}
                                                labelLine={false}
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                        No budget data available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </PageWrapper>
        </DashboardLayout>
    );
}
