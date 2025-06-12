'use client';

export function DashboardAdminHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrador</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Acompanhe o funcionamento da plataforma e tenha controle sobre os usuários
        </p>
      </div>
    </div>
  );
}
