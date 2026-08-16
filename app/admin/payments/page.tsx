'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPriceFCFA } from '@/lib/utils';

interface PaymentEntry {
  id: string;
  user_id: string;
  amount: number;
  operator: string;
  phone: string;
  status: string;
  reference: string;
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('payment_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setPayments(data as PaymentEntry[]);
      } catch {
        // Table may not exist yet
      }
      setIsLoading(false);
    };

    fetchPayments();
  }, []);

  const successPayments = payments.filter((p) => p.status === 'success');
  const totalRevenue = successPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const today = new Date();
  const todayStr = today.toDateString();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const revenueToday = successPayments
    .filter((p) => new Date(p.created_at).toDateString() === todayStr)
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const revenueWeek = successPayments
    .filter((p) => new Date(p.created_at) >= weekAgo)
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const revenueMonth = successPayments
    .filter((p) => new Date(p.created_at) >= monthAgo)
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Paiements & Revenus</h1>
        <p className="text-sm text-gray-500 mt-1">
          Suivi des paiements et revenus de la plateforme en temps réel.
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenu total', value: formatPriceFCFA(totalRevenue), icon: 'account_balance', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Aujourd\'hui', value: formatPriceFCFA(revenueToday), icon: 'today', color: 'text-blue-600 bg-blue-50' },
          { label: 'Cette semaine', value: formatPriceFCFA(revenueWeek), icon: 'date_range', color: 'text-violet-600 bg-violet-50' },
          { label: 'Ce mois', value: formatPriceFCFA(revenueMonth), icon: 'calendar_month', color: 'text-amber-600 bg-amber-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</span>
              <p className="font-display text-xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
              <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="font-display text-2xl font-bold text-gray-900">{payments.length}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Transactions totales</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <p className="font-display text-2xl font-bold text-gray-900">{successPayments.length}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Paiements réussis</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center col-span-2 lg:col-span-1">
          <p className="font-display text-2xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Abonnements actifs</p>
        </div>
      </div>

      {/* Payments History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-headline text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">receipt_long</span>
            Historique des paiements
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-4xl animate-pulse">hourglass_top</span>
            <p className="text-sm text-gray-400 mt-2">Chargement...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">receipt_long</span>
            <p className="text-sm text-gray-500 font-medium">Aucun paiement enregistré</p>
            <p className="text-xs text-gray-400 mt-1">
              Les paiements apparaîtront ici lorsque la monétisation sera activée et que des transactions seront effectuées.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    p.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                    p.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {p.status === 'success' ? 'check_circle' : p.status === 'pending' ? 'schedule' : 'cancel'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{formatPriceFCFA(p.amount)}</p>
                    <p className="text-xs text-gray-400">
                      {p.operator?.toUpperCase()} • {p.phone} • Réf: {p.reference}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
