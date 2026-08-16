'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormValues } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';

export default function MotDePasseOubliePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMsg('');
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/nouveau-mot-de-passe`,
    });
    setIsLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-lg border border-outline-variant/30 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[24px]">lock_reset</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Mot de passe oublié</h1>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Entrez votre email. Nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
            </div>
            <p className="text-sm text-on-surface text-center font-medium">
              Email envoyé ! Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <Link href="/auth/connexion" className="text-primary text-sm font-bold hover:underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-xs font-semibold text-center border border-error/20">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-label text-xs font-bold text-on-surface uppercase">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="votre@email.ci"
                  className="bg-surface-container-low px-4 py-2.5 rounded-lg text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-label text-sm font-bold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
            <div className="text-center text-xs text-on-surface-variant">
              <Link href="/auth/connexion" className="text-primary font-bold hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

