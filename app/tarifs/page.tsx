'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/lib/data/store';
import { MobileMoneyModal } from '@/components/payment/MobileMoneyModal';
import { createClient } from '@/lib/supabase/client';
import { SubscriptionPlan } from '@/types';

export default function TarifsPage() {
  const router = useRouter();
  const { subscriptionPlan } = useMarketplaceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [selectedAmount, setSelectedAmount] = useState(6000);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [prices, setPrices] = useState({
    perListing: 500,
    weekly: 2000,
    monthly: 6000,
  });

  // Load monetization settings from Supabase or default (OFF at launch)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('settings').select('*');
        if (data && data.length > 0) {
          const map: Record<string, string> = {};
          data.forEach((row: { key: string; value: string }) => {
            map[row.key] = row.value;
          });
          setMonetizationEnabled(map.monetization_enabled === 'true');
          setPrices({
            perListing: parseInt(map.price_per_listing) || 500,
            weekly: parseInt(map.price_weekly) || 2000,
            monthly: parseInt(map.price_monthly) || 6000,
          });
        }
      } catch (err) {
        setMonetizationEnabled(false);
      }
    };
    fetchSettings();
  }, []);

  const handlePlanAction = (plan: SubscriptionPlan, amount: number) => {
    if (!monetizationEnabled) {
      // Free at launch: redirect directly to publishing form
      router.push('/publier');
      return;
    }

    // If monetization is enabled by admin in future:
    setSelectedPlan(plan);
    setSelectedAmount(amount);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full bg-background pb-stack-lg min-h-screen">
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-container-margin py-8 sm:py-10 w-full flex flex-col gap-8">
        {/* Launch Free Mode Notification Banner */}
        {!monetizationEnabled && (
          <div className="bg-surface rounded-2xl p-6 sm:p-7 shadow-md border-2 border-primary/30 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[32px]">celebration</span>
            </div>
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold w-fit mb-1 shadow-sm">
                <span>Période de lancement</span>
              </div>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                🎉 Gratuit au lancement !
              </h2>
              <p className="font-body text-sm sm:text-base text-on-surface-variant mt-0.5">
                Profitez gratuitement de la plateforme pour publier et vendre tous vos objets inutilisés sans aucun frais.
              </p>
            </div>
          </div>
        )}

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Formule 1: À la publication */}
          <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-outline-variant/40 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[26px]">post_add</span>
              </div>

              <h3 className="font-headline text-xl font-bold text-on-surface">
                À la publication
              </h3>

              <p className="font-body text-xs text-on-surface-variant mt-1 mb-4">
                Idéal pour vendre un objet occasionnel de temps en temps.
              </p>

              <div className="mt-2 mb-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-primary">
                  {prices.perListing.toLocaleString('fr-FR')}
                </span>
                <span className="font-label text-xs font-bold text-on-surface-variant uppercase">
                  FCFA / publication
                </span>
              </div>

              <ul className="space-y-3.5 text-sm text-on-surface border-t border-outline-variant/30 pt-5">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span>1 annonce en ligne</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span>Jusqu'à 5 photos claires</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span>Messagerie & WhatsApp direct</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span>Visible jusqu'à la vente</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePlanAction('free', prices.perListing)}
              className="w-full mt-8 py-3.5 rounded-xl border-2 border-primary text-primary font-label text-sm font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {!monetizationEnabled ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Gratuit actuellement</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Choisir cette formule</span>
                </>
              )}
            </button>
          </div>

          {/* Formule 2: Hebdomadaire (Populaire) */}
          <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all border-2 border-primary relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full font-label text-xs font-bold shadow-md whitespace-nowrap flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              <span>Formule Populaire</span>
            </div>

            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-[26px]">date_range</span>
              </div>

              <h3 className="font-headline text-xl font-bold text-on-surface">
                Hebdomadaire
              </h3>

              <p className="font-body text-xs text-on-surface-variant mt-1 mb-4">
                Pour vendre plusieurs objets rapidement dans la semaine.
              </p>

              <div className="mt-2 mb-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-primary">
                  {prices.weekly.toLocaleString('fr-FR')}
                </span>
                <span className="font-label text-xs font-bold text-on-surface-variant uppercase">
                  FCFA / semaine
                </span>
              </div>

              <ul className="space-y-3.5 text-sm text-on-surface border-t border-outline-variant/30 pt-5">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-semibold">Publications illimitées pendant 7j</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span>Visibilité accrue dans les recherches</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span>Messagerie & WhatsApp direct</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span>Statistiques de vues en direct</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePlanAction('monthly', prices.weekly)}
              className="w-full mt-8 py-3.5 rounded-xl bg-primary text-on-primary font-label text-sm font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {!monetizationEnabled ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Gratuit actuellement</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Choisir cette formule</span>
                </>
              )}
            </button>
          </div>

          {/* Formule 3: Mensuel (Meilleure valeur) */}
          <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all border-2 border-secondary-container relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-label text-xs font-bold shadow-md whitespace-nowrap flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">star</span>
              <span>Meilleure Valeur</span>
            </div>

            <div>
              <div className="w-12 h-12 bg-secondary-container/15 rounded-2xl flex items-center justify-center text-secondary-container mb-4">
                <span className="material-symbols-outlined text-[26px]">calendar_month</span>
              </div>

              <h3 className="font-headline text-xl font-bold text-on-surface">
                Mensuel
              </h3>

              <p className="font-body text-xs text-on-surface-variant mt-1 mb-4">
                Pour les vendeurs réguliers et ceux qui ont beaucoup d'objets.
              </p>

              <div className="mt-2 mb-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-secondary">
                  {prices.monthly.toLocaleString('fr-FR')}
                </span>
                <span className="font-label text-xs font-bold text-on-surface-variant uppercase">
                  FCFA / mois
                </span>
              </div>

              <ul className="space-y-3.5 text-sm text-on-surface border-t border-outline-variant/30 pt-5">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-container text-[20px]">check_circle</span>
                  <span className="font-semibold">Publications illimitées pendant 30j</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-container text-[20px]">check_circle</span>
                  <span>Remontées prioritaires régulières</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-container text-[20px]">check_circle</span>
                  <span>Messagerie & WhatsApp direct</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary-container text-[20px]">check_circle</span>
                  <span>Assistance prioritaire</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePlanAction('annual', prices.monthly)}
              className="w-full mt-8 py-3.5 rounded-xl bg-secondary-container text-on-secondary-container font-label text-sm font-bold hover:bg-secondary hover:text-on-secondary transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {!monetizationEnabled ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Gratuit actuellement</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Choisir cette formule</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Accepted Payment Logos Footer */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div>
            <h4 className="font-headline text-base font-bold text-on-surface">Paiements 100% sécurisés en Côte d'Ivoire</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Intégration Mobile Money directe avec confirmation instantanée (Wave, Orange Money, MTN MoMo, Moov Money).
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="px-3.5 py-1.5 bg-[#1DA1F2]/10 text-[#1DA1F2] border border-[#1DA1F2]/20 rounded-xl font-bold text-xs">Wave CI</span>
            <span className="px-3.5 py-1.5 bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/20 rounded-xl font-bold text-xs">Orange Money</span>
            <span className="px-3.5 py-1.5 bg-[#FFCC00]/20 text-[#B38600] border border-[#FFCC00]/30 rounded-xl font-bold text-xs">MTN MoMo</span>
            <span className="px-3.5 py-1.5 bg-[#006699]/10 text-[#006699] border border-[#006699]/20 rounded-xl font-bold text-xs">Moov Money</span>
          </div>
        </div>
      </div>

      {/* Mobile Money Checkout Modal */}
      <MobileMoneyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
        amount={selectedAmount}
      />
    </div>
  );
}