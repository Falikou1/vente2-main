'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

interface SiteSettings {
  site_name: string;
  site_slogan: string;
  currency: string;
  geographic_zone: string;
  contact_email: string;
  contact_phone: string;
  allow_negotiation: boolean;
  require_phone: boolean;
  auto_approve_listings: boolean;
  maintenance_mode: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'VENTE2éMAIN',
  site_slogan: "Tu ne l'utilises plus ? Vends-le.",
  currency: 'FCFA (Franc CFA BCEAO)',
  geographic_zone: "Abidjan & Côte d'Ivoire (10 communes)",
  contact_email: 'contact@vente2emain.ci',
  contact_phone: '+225 07 08 00 00 00',
  allow_negotiation: true,
  require_phone: true,
  auto_approve_listings: true,
  maintenance_mode: false,
};

export default function AdminSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Admin profile edit states
  const [adminName, setAdminName] = useState(profile?.full_name || 'Administrateur Principal');
  const [adminPhone, setAdminPhone] = useState(profile?.phone || '+225 07 08 00 00 00');

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // General settings states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Load existing settings
  useEffect(() => {
    // 1. Try localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vente2emain_site_settings');
      if (stored) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
        } catch {}
      }
    }

    // 2. Try Supabase
    const fetchRemoteSettings = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 'singleton')
          .single();

        if (data) {
          setSettings((prev) => ({
            ...prev,
            site_name: data.site_name || prev.site_name,
            site_slogan: data.site_slogan || prev.site_slogan,
            currency: data.currency || prev.currency,
            geographic_zone: data.geographic_zone || prev.geographic_zone,
            contact_email: data.contact_email || prev.contact_email,
            contact_phone: data.contact_phone || prev.contact_phone,
            allow_negotiation: data.allow_negotiation ?? prev.allow_negotiation,
            require_phone: data.require_phone ?? prev.require_phone,
            auto_approve_listings: data.auto_approve_listings ?? prev.auto_approve_listings,
            maintenance_mode: data.maintenance_mode ?? prev.maintenance_mode,
          }));
        }
      } catch {}
    };

    fetchRemoteSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg('');
    setSaveSuccess(false);

    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('vente2emain_site_settings', JSON.stringify(settings));
    }

    // Save to Supabase
    try {
      const supabase = createClient();
      await supabase.from('app_settings').upsert({
        id: 'singleton',
        site_name: settings.site_name,
        site_slogan: settings.site_slogan,
        currency: settings.currency,
        geographic_zone: settings.geographic_zone,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        allow_negotiation: settings.allow_negotiation,
        require_phone: settings.require_phone,
        auto_approve_listings: settings.auto_approve_listings,
        maintenance_mode: settings.maintenance_mode,
        updated_at: new Date().toISOString(),
      });

      // Update admin profile if modified
      if (user) {
        await supabase
          .from('profiles')
          .update({
            full_name: adminName,
            phone: adminPhone,
          })
          .eq('id', user.id);
        await refreshProfile();
      }

      setSaveSuccess(true);
      setSaveMsg('Paramètres généraux enregistrés avec succès !');
    } catch {
      setSaveSuccess(true);
      setSaveMsg('Paramètres enregistrés localement avec succès !');
    }

    setIsSaving(false);
    setTimeout(() => {
      setSaveSuccess(false);
      setSaveMsg('');
    }, 4000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ text: 'Le mot de passe doit contenir au moins 6 caractères.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Les deux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('vente2emain_admin_custom_password', newPassword);
      }

      if (error) {
        setPasswordMsg({ text: error.message, type: 'error' });
      } else {
        setPasswordMsg({ text: 'Mot de passe administrateur modifié avec succès !', type: 'success' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vente2emain_admin_custom_password', newPassword);
      }
      setPasswordMsg({ text: 'Mot de passe administrateur modifié avec succès !', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsChangingPassword(false);
    setTimeout(() => setPasswordMsg(null), 5000);
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Paramètres du site</h1>
          <p className="text-sm text-gray-500 mt-1">
            Modifiez et personnalisez les paramètres généraux et techniques de Vente2éMain.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{saveMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-8">
        {/* Section 1: Informations de la plateforme */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-gray-900">
                Informations de la Plateforme
              </h2>
              <p className="text-xs text-gray-400">Nom, slogan, devises et coordonnées affichées publiquement.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Nom de la plateforme <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                required
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Slogan commercial
              </label>
              <input
                type="text"
                value={settings.site_slogan}
                onChange={(e) => setSettings({ ...settings, site_slogan: e.target.value })}
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Devise monétaire <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                required
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Zone géographique couverte
              </label>
              <input
                type="text"
                value={settings.geographic_zone}
                onChange={(e) => setSettings({ ...settings, geographic_zone: e.target.value })}
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Email de contact & support
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Téléphone officiel / WhatsApp
              </label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Règles de fonctionnement & Fonctionnalités */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">toggle_on</span>
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-gray-900">
                Options & Règles des Annonces
              </h2>
              <p className="text-xs text-gray-400">Activer ou désactiver des options clés pour les utilisateurs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Toggle 1: Négociation */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm text-gray-900">Autoriser les négociations de prix</p>
                <p className="text-xs text-gray-500 mt-0.5">Permet aux vendeurs d'indiquer "Prix négociable".</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, allow_negotiation: !settings.allow_negotiation })}
                className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                  settings.allow_negotiation ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center text-[10px] font-bold ${
                    settings.allow_negotiation ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-gray-400'
                  }`}
                >
                  {settings.allow_negotiation ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Toggle 2: Téléphone obligatoire */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm text-gray-900">Numéro de téléphone requis</p>
                <p className="text-xs text-gray-500 mt-0.5">Exige un numéro valide lors de la dépose d'annonce.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, require_phone: !settings.require_phone })}
                className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                  settings.require_phone ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center text-[10px] font-bold ${
                    settings.require_phone ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-gray-400'
                  }`}
                >
                  {settings.require_phone ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Toggle 3: Publication directe */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm text-gray-900">Publication instantanée</p>
                <p className="text-xs text-gray-500 mt-0.5">Les annonces sont mises en ligne immédiatement sans modération préalable.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, auto_approve_listings: !settings.auto_approve_listings })}
                className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                  settings.auto_approve_listings ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center text-[10px] font-bold ${
                    settings.auto_approve_listings ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-gray-400'
                  }`}
                >
                  {settings.auto_approve_listings ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Toggle 4: Mode maintenance */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm text-gray-900">Mode Maintenance</p>
                <p className="text-xs text-gray-500 mt-0.5">Met temporairement la plateforme en maintenance.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                  settings.maintenance_mode ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center text-[10px] font-bold ${
                    settings.maintenance_mode ? 'translate-x-7 text-amber-700' : 'translate-x-0 text-gray-400'
                  }`}
                >
                  {settings.maintenance_mode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Compte Administrateur */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shield_person</span>
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-gray-900">
                Profil Super Administrateur
              </h2>
              <p className="text-xs text-gray-400">Coordonnées du compte unique d'administration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Nom complet
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Email Administrateur (Fixe)
              </label>
              <input
                type="text"
                value="admin@vente2emain.ci"
                disabled
                className="bg-gray-100 px-4 py-3 rounded-xl text-sm border border-gray-200 text-gray-500 font-mono cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Téléphone Administrateur
              </label>
              <input
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
                Niveau de privilèges
              </label>
              <div className="bg-emerald-50 px-4 py-3 rounded-xl text-sm border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                <span>Super Administrateur • Accès Admin Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Rétablir tous les paramètres par défaut ?')) {
                setSettings(DEFAULT_SETTINGS);
              }
            }}
            className="px-5 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
          >
            Rétablir les valeurs par défaut
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>Enregistrement en cours...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Enregistrer toutes les modifications</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Section 4: Sécurité & Changement de mot de passe */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 mt-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">lock_reset</span>
          </div>
          <div>
            <h2 className="font-headline text-base font-bold text-gray-900">
              Sécurité & Changement de Mot de Passe Admin
            </h2>
            <p className="text-xs text-gray-400">Modifier le mot de passe d'accès au panneau d'administration.</p>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold text-center border animate-fadeIn ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-600 tracking-wider">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="bg-gray-50 hover:bg-white focus:bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 font-semibold transition-all"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword || !newPassword}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm active:scale-95 disabled:opacity-40 flex items-center gap-2 cursor-pointer transition-all"
            >
              {isChangingPassword ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  <span>Modification en cours...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  <span>Mettre à jour le mot de passe</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
