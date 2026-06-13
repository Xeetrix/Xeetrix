'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase-browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function redirectIfAlreadySignedIn() {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (data.session) {
        router.replace('/admin');
        return;
      }

      setIsCheckingSession(false);
    }

    redirectIfAlreadySignedIn();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace('/admin');
  }

  if (isCheckingSession) {
    return <main style={{ padding: '2rem' }}>Checking admin session…</main>;
  }

  return (
    <main style={{ margin: '0 auto', maxWidth: '28rem', padding: '4rem 1.5rem' }}>
      <h1>Robokart Admin Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{ display: 'block', marginTop: '0.5rem', width: '100%' }}
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{ display: 'block', marginTop: '0.5rem', width: '100%' }}
            type="password"
            value={password}
          />
        </label>
        {error ? <p role="alert" style={{ color: '#b00020' }}>{error}</p> : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
