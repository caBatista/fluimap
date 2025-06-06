'use client';

import { Menubar, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { cn } from '@/lib/utils';

type TabType = 'conta' | 'notificações';

interface SettingsTablistProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TABS: TabType[] = ['conta', 'notificações'];

export function SettingsTablist({ activeTab, setActiveTab }: SettingsTablistProps) {
  return (
    <Menubar className="mt-[18px] h-[40px] w-[185px] rounded-[6px] bg-[hsl(var(--muted))] p-1">
      {TABS.map((tabName) => {
        const label = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        return (
          <MenubarMenu key={tabName}>
            <MenubarTrigger
              onClick={() => {
                setActiveTab(tabName);
              }}
              className={cn(
                'm-1 flex h-[32px] w-auto cursor-pointer items-center justify-center rounded-[4px] px-2 py-1 text-sm leading-none',
                activeTab === tabName
                  ? 'm-1 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
                  : 'bg-transparent text-[hsl(var(--muted-foreground))]'
              )}
            >
              {label}
            </MenubarTrigger>
          </MenubarMenu>
        );
      })}
    </Menubar>
  );
}
