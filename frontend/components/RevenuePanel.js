"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Card";
import { TrendingUp, DollarSign } from "lucide-react";
import { api } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenuePanel({ enabled = true }) {
  const [stats, setStats] = useState({ totalRevenue: 0, projectRevenues: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setStats({ totalRevenue: 0, projectRevenues: [] });
      setHistory([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchRevenueData = async () => {
      try {
        setError(null);
        const [statsData, historyData] = await Promise.all([
          api.getRevenueStats(),
          api.getRevenueHistory(30),
        ]);

        if (!isMounted) return;

        setStats(statsData);
        setHistory(
          historyData.map((snapshot) => ({
            date: new Date(snapshot.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            revenue: snapshot.totalRevenue,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch revenue data", err);
        if (isMounted) {
          setError(
            "Unable to connect to server. Please check if backend is running."
          );
          setStats({ totalRevenue: 0, projectRevenues: [] });
          setHistory([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchRevenueData();

    const interval = setInterval(fetchRevenueData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [enabled]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Revenue Overview
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!enabled ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            Waiting for authentication…
          </p>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <p className="text-gray-500 text-xs mt-2">
              Make sure backend is running on port 5000
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  Revenue by Project
                </p>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {stats.projectRevenues.map((pr) => (
                    <div
                      key={pr.projectId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: pr.projectColor || "#2563eb",
                          }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {pr.projectName}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(pr.amount)}
                      </span>
                    </div>
                  ))}
                  {stats.projectRevenues.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No revenue data yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {history.length > 1 && (
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Revenue Trend (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
