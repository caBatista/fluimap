'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Users, BarChart4, Settings, LogOut } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const localPart = email.split('@')[0] ?? '';
  const displayName = user?.fullName?.trim() ? user.fullName : localPart;
  const cargo =
    typeof user?.publicMetadata?.cargo === 'string' ? user.publicMetadata.cargo : 'gestor';

  return (
    <div className="z-50 flex h-screen w-[256px] flex-col bg-[hsl(var(--sidebar-bg))] shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <header className="flex h-[64px] w-[256px] items-center justify-center border-b border-[hsl(var(--sidebar-border))]">
        <h1 className="text-2xl font-bold">
          <span className="text-[hsl(var(--primary))]">FluiMap</span>
        </h1>
      </header>

      {/* Navegação */}
      <nav className="mt-4 flex flex-col items-start gap-[4px] px-2">
        <SidebarItem
          href="/fluimap/home"
          icon={<Home size={20} />}
          label="Dashboard"
          currentPath={pathname}
        />
        <SidebarItem
          href="/fluimap/surveys/create"
          icon={<ClipboardList size={20} />}
          label="Formulário"
          currentPath={pathname}
        />
        <SidebarItem
          href="/fluimap/teams"
          icon={<Users size={20} />}
          label="Times"
          currentPath={pathname}
        />
        <SidebarItem
          href="/fluimap/reports"
          icon={<BarChart4 size={20} />}
          label="Relatórios"
          currentPath={pathname}
        />
        <SidebarItem
          href="/fluimap/settings"
          icon={<Settings size={20} />}
          label="Configuração"
          currentPath={pathname}
        />
        <SidebarItem
          href="/questionnaire/selectUsers"
          icon={<ClipboardList size={20} />}
          label="Questionário"
          currentPath={pathname}
        />
      </nav>

      {/* Footer – Perfil e Logout */}
      <footer className="mt-auto flex h-[71px] w-full items-center justify-between border-t border-[hsl(var(--sidebar-border))] p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            {user?.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-[hsl(var(--sidebar-avatar-bg))]" />
            )}
          </Avatar>
          <div>
            <div className="text-sm font-medium text-[hsl(var(--sidebar-text))]">{displayName}</div>
            <div className="text-xs text-[hsl(var(--sidebar-text))]">{cargo}</div>
          </div>
        </div>
        <Button
          variant="default"
          size="icon"
          onClick={() => signOut()}
          className="cursor-pointer bg-[hsl(var(--sidebar-logout-btn-bg))] text-[hsl(var(--sidebar-logout-btn-text))] shadow-none"
        >
          <LogOut size={20} />
        </Button>
      </footer>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  currentPath,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  currentPath: string;
}) {
  const isActive = currentPath.startsWith(href);
  return (
    <Link href={href}>
      <div
        className={`flex h-[36px] w-[240px] cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-active-text))]'
            : 'text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover-bg))]'
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
