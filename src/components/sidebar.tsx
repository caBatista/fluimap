"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Users,
  BarChart4,
  Settings,
  LogOut,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const localPart = email.split("@")[0] ?? "";
  const displayName = user?.fullName?.trim() ? user.fullName : localPart;
  const cargo =
    typeof user?.publicMetadata?.cargo === "string"
      ? user.publicMetadata.cargo
      : "gestor";

  return (
    <div className="flex h-screen w-[256px] flex-col bg-white shadow-md">
      {/* Header */}
      <header className="flex h-[64px] w-[256px] items-center justify-center border-b border-[#E7E5E4]">
        <h1 className="text-2xl font-bold">
          <span className="text-[#3C83F6]">FluiMap</span>
        </h1>
      </header>

      {/* Navegação */}
      <nav className="mt-4 flex flex-col items-start gap-[4px] px-2">
        <SidebarItem
          href="/home"
          icon={<Home size={20} />}
          label="Dashboard"
          currentPath={pathname}
        />
        <SidebarItem
          href="/surveys"
          icon={<ClipboardList size={20} />}
          label="Formulario"
          currentPath={pathname}
        />
        <SidebarItem
          href="/times"
          icon={<Users size={20} />}
          label="Times"
          currentPath={pathname}
        />
        <SidebarItem
          href="/relatorios"
          icon={<BarChart4 size={20} />}
          label="Relatorios"
          currentPath={pathname}
        />
        <SidebarItem
          href="/configuracao"
          icon={<Settings size={20} />}
          label="Configuracao"
          currentPath={pathname}
        />
      </nav>

      {/* Footer – Perfil e Logout */}
      <footer className="mt-auto flex h-[71px] w-full items-center justify-between border-t border-[#E7E5E4] p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            {user?.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt="Profile" />
            ) : (
              // Apenas cor de fundo, sem iniciais
              <AvatarFallback className="bg-[#F5F5F4]" />
            )}
          </Avatar>
          {/* Nome e cargo */}
          <div>
            <div className="text-sm font-medium text-[#374151]">
              {displayName}
            </div>
            <div className="text-xs text-[#374151]">{cargo}</div>
          </div>
        </div>
        <Button
          variant="default"
          size="icon"
          onClick={() => signOut()}
          className="cursor-pointer bg-white shadow-none"
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
  const isActive = currentPath === href;

  return (
    <Link href={href}>
      <div
        className={`flex h-[36px] w-[240px] cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-[#3C83F6] text-white"
            : "text-[#374151] hover:bg-gray-100"
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
