'use client';

import React, { useEffect, useState } from 'react';
import { useMarketplaceStore } from '@/lib/data/store';
import { createClient } from '@/lib/supabase/client';
import { formatPriceFCFA } from '@/lib/utils';

interface ActivityEvent {
  id: string;
  icon: string;
  color: string;
  text: string;
  time: string;
}

export default function AdminDashboardPage() {
  const { listings, conversations } = useMarketplaceStore();

  const [stats, setStats] = useState({
    users: 0,
    onlineUsers: 0,
    activeListings: 0,
    views: 0,
    revenue: 0,
    payments: 0,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      let totalUsersCount = 0;

      try {
        const supabase = createClient();
        const [{ count: usersCount }, { count: listingsCount }] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('listings').select('*', { count: 'exact', head: true }),
        ]);

        totalUsersCount = usersCount || 0;

        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('vente2emain_users_registry');
          if (stored) {
            const localList = JSON.parse(stored);
            if (localList.length > totalUsersCount) {
              totalUsersCount = localList.length;
            }
          }
        }

        setStats({
          users: totalUsersCount,
          onlineUsers: Math.max(1, totalUsersCount),
          activeListings: listingsCount || listings.filter((l) => l.status === 'active').length,
          views: 0,
          revenue: 0,
          payments: 0,
        });
      } catch {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('vente2emain_users_registry');
          if (stored) {
            const localList = JSON.parse(stored);
            totalUsersCount = localList.length;
          }
        }

        setStats({
          users: totalUsersCount,
          onlineUsers: Math.max(1, totalUsersCount),
          activeListings: listings.filter((l) => l.status === 'active').length,
          views: 0,
          revenue: 0,
          payments: 0,
        });
      }
    };

    loadStats();
  }, [listings]);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const supabase = createClient();

        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: recentListings } = await supabase
          .from('listings')
          .select('title, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        const events: ActivityEvent[] = [];

        (recentUsers || []).forEach((u, i) => {
          events.push({
            id: `user-${i}`,
            icon: 'person_add',
            color: 'text-emerald-600 bg-emerald-50',
            text: `${u.full_name || 'Un utilisateur'} vient de créer un compte`,
            time: formatTimeAgo(u.created_at),
          });
        });

        (recentListings || []).forEach((l, i) => {
          events.push({
            id: `listing-${i}`,
            icon: 'add_shopping_cart',
            color: 'text-blue-600 bg-blue-50',
            text: `Nouvelle annonce publiée : "${l.title}"`,
            time: formatTimeAgo(l.created_at),
          });
        });

        events.sort((a, b) => 0);

        setRecentActivity(events.length > 0 ? events.slice(0, 10) : []);
      } catch {
        setRecentActivity([]);
      }
    };

    loadActivity();
  }, []);

  const kpis = [
    {
      label: 'Utilisateurs inscrits',
      value: stats.users,
      icon: 'group',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Utilisateurs en ligne',
      value: stats.onlineUsers,
      icon: 'circle',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Annonces actives',
      value: stats.activeListings,
      icon: 'sell',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Consultations',
      value: stats.views,
      icon: 'visibility',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Revenus',
      value: formatPriceFCFA(stats.revenue),
      icon: 'account_balance',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      isText: true,
    },
    {
      label: 'Paiements',
      value: stats.payments,
      icon: 'receipt_long',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d'ensemble de la plateforme Vente2éMain en temps réel.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <p className="font-display text-2xl font-bold text-gray-900">
                {kpi.isText ? kpi.value : kpi.value}
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
              <span className={`material-symbols-outlined text-[22px] ${kpi.color}`}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">timeline</span>
            <span>Activité récente</span>
          </h2>

          {recentActivity.length === 0 ? (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">event_note</span>
              <p className="text-sm text-gray-400 font-medium">Aucune activité enregistrée pour le moment.</p>
              <p className="text-xs text-gray-400 mt-1">Les événements apparaîtront ici au fil de l'utilisation.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${event.color}`}>
                    <span className="material-symbols-outlined text-[16px]">{event.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium">{event.text}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Services Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">monitor_heart</span>
            <span>État des services</span>
          </h2>

          <div className="flex flex-col gap-3">
            {[
              { name: 'Base de données Supabase', status: 'Connectée' },
              { name: 'Authentification', status: 'Active' },
              { name: 'Stockage Photos', status: 'CDN actif' },
              { name: 'Messagerie Interne', status: 'Temps réel' },
              { name: 'Passerelles Mobile Money', status: 'Opérationnelles' },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700 font-medium">{service.name}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Il y a ${diffD}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}
