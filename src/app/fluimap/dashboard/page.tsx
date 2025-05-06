'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { DashboardRecentForms } from '@/components/dashboard/dashboard-recent-forms';
import { DashboardEngagement } from '@/components/dashboard/dashboard-engagement';

export default function CreateDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
      <DashboardHeader />
      <DashboardCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-5">
        <DashboardRecentForms />
        <DashboardEngagement />
      </div>
    </div>
  );
}
