'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const { loginAsAdmin, loginAsUser } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg('');

    const emailClean = data.email.trim().toLowerCase();

    // 1. Administrator Login
    if (emailClean === 'admin@vente2emain.ci' || emailClean.startsWith('admin@')) {
      const success = await loginAsAdmin(data.password);
      setIsLoading(false);

      if (!success) {
        setErrorMsg('Email ou mot de passe administrateur incorrect.');
        return;
      }

      router.push(redirectTo || '/admin/dashboard');
      router.refresh();
      return;
    }

    // 2. Standard User Login (with instant fallback for created accounts)
    const res = await loginAsUser(data.email, data.password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Email ou mot de passe incorrect.');
      return;
    }

    router.push(redirectTo || '/profil');
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-xl border border-outline-variant/30 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary mx-auto flex items-center justify-center mb-3 shadow-md">
            <span className="material-symbols-outlined text-[28px]">storefront</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Connexion à votre compte</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Retrouvez vos annonces, messages et favoris sur Vente2éMain.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error/10 text-error text-xs font-semibold text-center border border-error/20 animate-fadeIn">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="votre@email.ci"
              className="bg-surface-container-low/90 px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
            />
            {errors.email && <p className="text-xs text-error font-medium">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">Mot de passe</label>
              <Link href="/auth/mot-de-passe-oublie" className="text-xs text-primary hover:underline font-medium">
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••••••"
                className="w-full bg-surface-container-low/90 px-4 py-3 pr-11 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface font-semibold"
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

          <button
            type="submit"
            id="btn-connexion"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-label text-sm font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
          Pas encore de compte ?{' '}
          <Link href="/auth/inscription" className="text-primary font-bold hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  );
}