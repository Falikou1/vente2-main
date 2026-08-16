'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Utilisateurs', href: '/admin/users', icon: 'group' },
  { label: 'Annonces & Objets', href: '/admin/listings', icon: 'inventory_2' },
  { label: 'Paiements & Revenus', href: '/admin/payments', icon: 'account_balance_wallet' },
  { label: 'Monétisation & Tarifs', href: '/admin/monetization', icon: 'payments' },
  { label: 'Paramètres', href: '/admin/settings', icon: 'settings' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/connexion');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0a1f1b] text-white flex flex-col z-50 shadow-2xl">
      {/* Admin Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
            <span className="material-symbols-outlined text-emerald-400 text-[22px]">shield</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold tracking-tight text-white leading-none">
              VENTE2<span className="text-emerald-400">é</span>MAIN
            </span>
            <span className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-widest mt-0.5">
              Administration
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-emerald-400' : 'text-white/40'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile Footer */}
      <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
            AP
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">Administrateur Principal</span>
            <span className="text-[10px] text-white/40 font-mono truncate">admin@vente2emain.ci</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/15 text-white/50 hover:text-red-400 text-xs font-semibold transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
