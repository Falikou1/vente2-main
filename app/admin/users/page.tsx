'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UserEntry {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  commune: string;
  created_at: string;
  is_verified: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsRefreshing(true);
    let combinedUsers: UserEntry[] = [];

    // 1. Fetch from Supabase
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role, commune, created_at, is_verified')
        .order('created_at', { ascending: false });

      if (data && !error) {
        combinedUsers = [...(data as UserEntry[])];
      }
    } catch {}

    // 2. Merge with local users registry cache (for instant sync)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vente2emain_users_registry');
        if (stored) {
          const localList: UserEntry[] = JSON.parse(stored);
          localList.forEach((localUser) => {
            if (!combinedUsers.some((u) => u.email?.toLowerCase() === localUser.email?.toLowerCase())) {
              combinedUsers.push(localUser);
            }
          });
        }
      } catch {}
    }

    setUsers(combinedUsers);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUsers();

    // Periodic auto-refresh every 10 seconds for real-time synchronization
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.commune?.toLowerCase().includes(q)
    );
  });

  const totalUsers = users.length;
  const newToday = users.filter((u) => {
    const d = new Date(u.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const sellers = users.filter((u) => u.role === 'seller').length;
  const admins = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion et suivi en direct des comptes utilisateurs créés sur la plateforme.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={isRefreshing}
          className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer w-fit shrink-0 active:scale-95"
        >
          <span className={`material-symbols-outlined text-[16px] text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{isRefreshing ? 'Synchronisation...' : 'Actualiser'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inscrits', value: totalUsers, icon: 'group', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Nouveaux aujourd\'hui', value: newToday, icon: 'person_add', color: 'text-blue-600 bg-blue-50' },
          { label: 'Vendeurs actifs', value: sellers, icon: 'storefront', color: 'text-amber-600 bg-amber-50' },
          { label: 'Administrateurs', value: admins, icon: 'shield', color: 'text-violet-600 bg-violet-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[11px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & User List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email, téléphone ou commune..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>
          <span className="text-xs text-gray-400 font-bold shrink-0">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-4xl animate-pulse">hourglass_top</span>
            <p className="text-sm text-gray-400 mt-2 font-medium">Synchronisation des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">group_off</span>
            <p className="text-sm text-gray-500 font-bold">Aucun utilisateur trouvé</p>
            <p className="text-xs text-gray-400 mt-1">
              Les nouveaux comptes créés apparaîtront automatiquement ici en temps réel.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <div key={user.id || user.email} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {user.full_name?.slice(0, 2) || user.email?.slice(0, 2) || 'UT'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.full_name || 'Utilisateur'}</p>
                      {user.is_verified && (
                        <span className="material-symbols-outlined text-emerald-600 text-[14px]" title="Vérifié">
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate">{user.email}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">phone</span>
                          <span>{user.phone}</span>
                        </span>
                      )}
                      {user.commune && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">location_on</span>
                          <span>{user.commune}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    user.role === 'admin'
                      ? 'bg-violet-100 text-violet-700'
                      : user.role === 'seller'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Vendeur' : 'Membre'}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
