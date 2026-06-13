'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { supabase, SupabaseSession } from '../../lib/supabase-browser';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isLoginRoute = pathname === '/admin/login';

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      setIsCheckingSession(true);
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(data.session);
      setIsCheckingSession(false);

      if (!data.session && !isLoginRoute) {
        router.replace('/admin/login');
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession && !isLoginRoute) {
        router.replace('/admin/login');
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isLoginRoute, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (isCheckingSession) {
    return <main style={{ padding: '2rem' }}>Checking admin session…</main>;
  }

  if (!session) {
    return <main style={{ padding: '2rem' }}>Redirecting to admin login…</main>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <p style={{ margin: 0, opacity: 0.7 }}>Signed in as</p>
          <strong>{session.user.email}</strong>
        </div>
        <button onClick={handleLogout} type="button">
          Logout
        </button>
      </header>
      {children}
    </main>
  );
}
