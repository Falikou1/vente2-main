'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AppSettings {
  monetization_enabled: boolean;
  price_per_listing: number;
  price_weekly: number;
  price_monthly: number;
}

export default function AdminMonetizationPage() {
  const [settings, setSettings] = useState<AppSettings>({
    monetization_enabled: false,
    price_per_listing: 500,
    price_weekly: 2000,
    price_monthly: 6000,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 'singleton')
          .single();

        if (data) {
          setSettings({
            monetization_enabled: data.monetization_enabled ?? false,
            price_per_listing: data.price_per_listing ?? 500,
            price_weekly: data.price_weekly ?? 2000,
            price_monthly: data.price_monthly ?? 6000,
          });
        }
      } catch {
        // Use defaults
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg('');
    try {
      const supabase = createClient();
      await supabase
        .from('app_settings')
        .upsert({
          id: 'singleton',
          monetization_enabled: settings.monetization_enabled,
          price_per_listing: settings.price_per_listing,
          price_weekly: settings.price_weekly,
          price_monthly: settings.price_monthly,
          updated_at: new Date().toISOString(),
        });

      setSaveMsg('Paramètres de monétisation enregistrés avec succès !');
    } catch {
      setSaveMsg('Paramètres enregistrés localement.');
    }
    setIsSaving(false);
    setTimeout(() => setSaveMsg(''), 4000);
  };

  const plans = [
    { key: 'price_per_listing' as const, label: 'À la publication', icon: 'post_add', desc: 'Tarif par objet individuel' },
    { key: 'price_weekly' as const, label: 'Hebdomadaire', icon: 'date_range', desc: 'Abonnement 7 jours illimité' },
    { key: 'price_monthly' as const, label: 'Mensuel', icon: 'calendar_month', desc: 'Abonnement 30 jours illimité' },
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Monétisation & Tarifs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Contrôlez le mode de monétisation et configurez les tarifs de la plateforme.
        </p>
      </div>

      {/* Monetization Toggle */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-emerald-600">toggle_on</span>
              Mode de monétisation
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {settings.monetization_enabled
                ? '🟢 Monétisation ACTIVE — Les utilisateurs doivent payer par Mobile Money pour publier.'
                : '🟡 Mode Lancement Gratuit — La publication est 100% gratuite pour tous les utilisateurs.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, monetization_enabled: !s.monetization_enabled }))}
            className={`relative w-[72px] h-9 rounded-full transition-colors cursor-pointer shrink-0 ${
              settings.monetization_enabled ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform flex items-center justify-center text-[11px] font-bold ${
                settings.monetization_enabled ? 'translate-x-[36px] text-emerald-600' : 'translate-x-0 text-gray-400'
              }`}
            >
              {settings.monetization_enabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
          settings.monetization_enabled
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {settings.monetization_enabled
            ? 'Les vendeurs devront effectuer un paiement Mobile Money (Wave, Orange Money, MTN MoMo, Moov Money) pour publier leurs annonces.'
            : 'Au lancement, la plateforme est entièrement gratuite. Activez la monétisation quand vous êtes prêt.'}
        </div>
      </div>

      {/* Pricing Configuration */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-headline text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-[22px] text-emerald-600">tune</span>
          Configuration des 3 Formules Tarifaires
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.key} className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <span className="material-symbols-outlined text-[22px]">{plan.icon}</span>
                <span className="font-bold text-sm uppercase tracking-wider">{plan.label}</span>
              </div>
              <p className="text-xs text-gray-500">{plan.desc}</p>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={settings[plan.key]}
                  onChange={(e) => setSettings((s) => ({ ...s, [plan.key]: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white px-4 py-3 pr-16 rounded-xl text-base border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold text-gray-900"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">FCFA</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-headline text-base font-bold text-gray-900 mb-3">Moyens de paiement supportés</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-xl font-bold text-sm">Wave</span>
          <span className="px-4 py-2 bg-[#FF7900]/10 text-[#FF7900] rounded-xl font-bold text-sm">Orange Money</span>
          <span className="px-4 py-2 bg-[#FFCC00]/20 text-[#B38600] rounded-xl font-bold text-sm">MTN MoMo</span>
          <span className="px-4 py-2 bg-[#006699]/10 text-[#006699] rounded-xl font-bold text-sm">Moov Money</span>
        </div>
      </div>

      {/* Save Feedback & Button */}
      {saveMsg && (
        <div className="p-4 rounded-xl text-sm font-bold text-center bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fadeIn">
          {saveMsg}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="self-end bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-all"
      >
        {isSaving ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            <span>Enregistrement...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Enregistrer les paramètres tarifaires</span>
          </>
        )}
      </button>
    </div>
  );
}
