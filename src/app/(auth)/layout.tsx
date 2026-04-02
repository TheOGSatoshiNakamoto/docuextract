'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session && pathname !== '/login') {
        router.replace('/login');
        return;
      }
      if (session && pathname === '/login') {
        router.replace('/dashboard');
        return;
      }

      // Proactively verify the session is still valid by attempting a refresh.
      // This catches stale/corrupted JWTs that getSession() returns without error.
      if (session) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshed.session) {
          // Session is dead — clear it and redirect to login
          await supabase.auth.signOut();
          if (pathname !== '/login') {
            router.replace('/login?error=session_expired');
            return;
          }
        }
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/login') {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/dashboard');
      } else {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-on-surface-variant text-sm font-headline">Loading&hellip;</div>
      </div>
    );
  }

  // Login page does not get the dashboard shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // All dashboard routes get the shell
  return <DashboardLayout>{children}</DashboardLayout>;
}
