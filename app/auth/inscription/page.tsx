'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormValues } from '@/lib/validations/auth';
import { COMMUNE_OPTIONS } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function InscriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState('Cocody');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      commune: 'Cocody',
      accept_terms: false,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const supabase = createClient();
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.full_name.trim(),
            phone: data.phone.trim(),
            commune: selectedCommune,
            role: 'user',
          },
        },
      });

      if (error) {
        setIsLoading(false);
        if (error.message.includes('User already registered')) {
          setErrorMsg('Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      // Also ensure profile record is inserted in Supabase DB profiles table for Admin visibility
      const newUserId = signUpData.user?.id || `user-${Date.now()}`;
      try {
        await supabase.from('profiles').upsert({
          id: newUserId,
          email: data.email.trim(),
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          commune: selectedCommune,
          role: 'user',
          is_verified: true,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.error('Error inserting into profiles:', dbErr);
      }

      // Also update local registered users cache for instant Admin synchronization
      if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem('vente2emain_users_registry');
        const userList = storedUsers ? JSON.parse(storedUsers) : [];
        const newUserEntry = {
          id: newUserId,
          email: data.email.trim(),
          password: data.password,
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          commune: selectedCommune,
          role: 'user',
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        const updatedList = [newUserEntry, ...userList.filter((u: any) => u.email !== data.email.trim())];
        localStorage.setItem('vente2emain_users_registry', JSON.stringify(updatedList));
      }

      setIsLoading(false);
      setSuccessMsg('Compte créé avec succès ! Redirection vers la page de connexion...');
      setTimeout(() => {
        router.push('/auth/connexion');
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Erreur lors de la création du compte.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-xl border border-outline-variant/30 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary mx-auto flex items-center justify-center mb-3 shadow-md">
            <span className="material-symbols-outlined text-[28px]">person_add</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Créer un compte</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Achetez et vendez facilement au sein de la communauté ivoirienne.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200 flex items-center gap-2 justify-center shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error/10 text-error text-xs font-semibold text-center border border-error/20 animate-fadeIn">
            {errorMsg}
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Nom complet */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('full_name')}
                placeholder="Ex: Fofana Falikou"
                className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
              />
              {errors.full_name && <p className="text-xs text-error font-medium">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="votre@email.ci"
                className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
              />
              {errors.email && <p className="text-xs text-error font-medium">{errors.email.message}</p>}
            </div>

            {/* Téléphone & Commune */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="07 08 12 34 56"
                  className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
                />
                {errors.phone && <p className="text-xs text-error font-medium">{errors.phone.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                  Commune <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={COMMUNE_OPTIONS.filter((c) => c !== 'Tout Abidjan')}
                  value={selectedCommune}
                  onChange={(val) => {
                    setSelectedCommune(val);
                    setValue('commune', val);
                  }}
                  icon="location_on"
                />
              </div>
            </div>

            {/* Mot de passe with View Eye */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Au moins 6 caractères"
                  className="w-full bg-surface-container-low px-4 py-3 pr-11 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error font-medium">{errors.password.message}</p>}
            </div>

            {/* Confirmation mot de passe with View Eye */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  placeholder="Répétez votre mot de passe"
                  className="w-full bg-surface-container-low px-4 py-3 pr-11 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer p-1"
                  title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-error font-medium">{errors.confirm_password.message}</p>}
            </div>

            {/* Accept terms */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                {...register('accept_terms')}
                className="mt-0.5 rounded border-outline-variant/50 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              />
              <span className="text-xs text-on-surface-variant">
                J'accepte les{' '}
                <Link href="/conditions" className="text-primary font-bold hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" className="text-primary font-bold hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>
            {errors.accept_terms && <p className="text-xs text-error font-medium">{errors.accept_terms.message}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-label text-sm font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              {isLoading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
          Vous avez déjà un compte ?{' '}
          <Link href="/auth/connexion" className="text-primary font-bold hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}