'use client';

import { useState, useEffect } from 'react';
import { SettingsHeader } from '@/components/settings/settings-header';
import { AccountCard, type AccountData } from '@/components/settings/account/account-card';
import { DeleteAccount } from '@/components/settings/account/delete-account';
import { useUser } from '@clerk/nextjs';


export default function SettingsPage() {
  const { user } = useUser();
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAccount = async () => {
      try {
        void (async () => {
          const res = await fetch(`/api/users/${user.id}`);
          if (!res.ok) return;
          const json = (await res.json()) as AccountData;
          setAccountData({
            name: json.name ?? user.fullName ?? '',
            email: json.email ?? user.primaryEmailAddress?.emailAddress ?? '',
          });
        })();
      } catch (err) {
        console.error('Failed to fetch account data', err);
      }
    };
    void fetchAccount();
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col px-8 py-4">
      <SettingsHeader />

      <div className="mt-[40px]">
        <>
          {accountData && <AccountCard initialData={accountData} />}
          <div className="mt-[40px]">
            <DeleteAccount />
          </div>
        </>
      </div>
    </div>
  );
}
