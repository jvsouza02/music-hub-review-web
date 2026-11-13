import { LogoutButton } from '@/features/auth/components/logout-button';
import { requireAuthenticatedSession } from '@/lib/auth/guards';

export default async function AccountPage() {
  const session = await requireAuthenticatedSession();
  const { user } = session;

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <section className="space-y-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-primary">ÁREA AUTENTICADA</p>

          <h1 className="text-3xl font-bold tracking-tight">Olá, {user.username}!</h1>

          <p className="text-muted-foreground">Você está autenticado no Music Hub Review.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Nome de usuário</p>
            <p className="mt-1 font-medium">{user.username}</p>
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">E-mail</p>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Nível de acesso</p>
            <p className="mt-1 font-medium">{user.role}</p>
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Conta</p>
            <p className="mt-1 font-medium">{user.is_active ? 'Ativa' : 'Inativa'}</p>
          </div>
        </div>

        <LogoutButton csrfToken={session.csrfToken} />
      </section>
    </main>
  );
}
