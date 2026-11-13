import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/login-form';
import { getCurrentSession } from '@/lib/auth/session';

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session?.user.is_active) {
    redirect('/account');
  }

  return (
    <main className="container mx-auto flex min-h-[calc(100svh-10rem)] max-w-7xl items-center justify-center px-4 py-12">
      <section className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="space-y-3 text-center">
          <Link href="/" className="text-sm font-semibold tracking-wide text-primary">
            MUSIC HUB REVIEW
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>

          <p className="text-sm text-muted-foreground">
            Entre na sua conta para participar da comunidade.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
