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
import { useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="flex h-[100vh] w-[256px] flex-col bg-secondary shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
      {/* Header */}
      <header className="flex h-[64px] w-[256px] items-center justify-center border-b border-border">
        <h1 className="text-2xl font-bold">
          <span className="text-primary">FluiMap</span>
        </h1>
      </header>

      <nav className="mt-4 flex flex-col items-start gap-[4px] px-2">
        <SidebarItem
          href="/home"
          icon={<Home size={18} />}
          label="Dashboard"
          currentPath={pathname}
        />
        <SidebarItem
          href="/formulario"
          icon={<ClipboardList size={18} />}
          label="Formulario"
          currentPath={pathname}
        />
        <SidebarItem
          href="/times"
          icon={<Users size={18} />}
          label="Times"
          currentPath={pathname}
        />
        <SidebarItem
          href="/relatorios"
          icon={<BarChart4 size={18} />}
          label="Relatorios"
          currentPath={pathname}
        />
        <SidebarItem
          href="/configuracao"
          icon={<Settings size={18} />}
          label="Configuracao"
          currentPath={pathname}
        />
      </nav>

      {/* Footer */}
      <footer className="mt-auto flex h-[71px] w-[256px] items-center justify-between border-t border-border p-4">
        <div className="flex items-center gap-2">
          {/* Iniciais do usuário */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-medium text-text">
            {user?.firstName?.[0]?.toUpperCase() ?? "?"}
          </div>

          <div>
            {/* Nome do usuário (fallback: 'example') */}
            <div className="text-sm font-medium text-text">
              {user?.fullName ?? "example"}
            </div>
            {/* Cargo do usuário (fallback: 'gestor') */}
            <div className="text-xs text-text">
              {typeof user?.publicMetadata?.cargo === "string"
                ? user.publicMetadata.cargo
                : "gestor"}
            </div>
          </div>
        </div>

        <button className="rounded-md p-2 text-text">
          <LogOut size={18} />
        </button>
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
  // Considera somente a rota exata como ativa
  const isActive = currentPath === href;

  return (
    <Link href={href}>
      
      <div
        className={`flex h-[36px] w-[240px] cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-text hover:bg-gray-100"
        }`}
      >
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
