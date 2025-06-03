'use client';

import { useState, useEffect } from 'react';
import { SettingsHeader } from '@/components/settings/settings-header';
import { SettingsTablist } from '@/components/settings/settings-tablist';
import { AccountCard, type AccountData } from '@/components/settings/account/account-card';

import { useUser } from '@clerk/nextjs';
import { DeleteAccount } from '@/components/settings/account/delete-account';

type Tab = 'conta' | 'notificações';

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('conta');

  const [accountData, setAccountData] = useState<AccountData | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const res = await fetch(`/api/users/${user.id}`);
      if (!res.ok) return;
      const json = await res.json();
      setAccountData({
        name: json.name || user.fullName || '',
        email: json.email || user.primaryEmailAddress?.emailAddress || '',
      });
    })();
  }, [user?.id, user?.fullName, user?.primaryEmailAddress]);

  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
      <SettingsHeader />
      <SettingsTablist activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-[40px]">
        {activeTab === 'conta' && (
          <>
            {accountData && <AccountCard initialData={accountData} />}
            <div className="mt-[40px]">
              <DeleteAccount />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
