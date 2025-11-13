'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PageWrapper from '@/components/PageWrapper';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-blue-200 bg-white/60 p-10 text-center text-slate-700 shadow-lg shadow-blue-900/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
          <h1 className="text-2xl font-semibold">Analytics coming soon</h1>
          <p className="max-w-md text-base">
            This space will host executive dashboards, trend reports, and the key indicators you need to run
            your studio. It already inherits Clerk guard rails so the data will stay locked behind the
            authenticated perimeter.
          </p>
        </div>
      </PageWrapper>
    </DashboardLayout>
  );
}
