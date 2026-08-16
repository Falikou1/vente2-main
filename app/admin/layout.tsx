'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { UNIQUE_ADMIN_EMAIL } from '@/lib/supabase/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.email?.toLowerCase() === UNIQUE_ADMIN_EMAIL;

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/auth/connexion?redirectTo=/admin/dashboard');
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f2922] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-emerald-400 text-5xl animate-pulse">shield</span>
          <p className="text-emerald-400/70 text-sm font-semibold">Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      <AdminSidebar />
      <main className="flex-1 ml-[260px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
