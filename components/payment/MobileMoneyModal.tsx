'use client';

import React, { useState } from 'react';
import { MobileMoneyOperator, SubscriptionPlan } from '@/types';
import { useMarketplaceStore } from '@/lib/data/store';

interface MobileMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  amount: number;
}

export const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({
  isOpen,
  onClose,
  plan,
  amount,
}) => {
  const { setSubscription } = useMarketplaceStore();
  const [operator, setOperator] = useState<MobileMoneyOperator>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'waiting' | 'success'>('input');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const operators: { id: MobileMoneyOperator; name: string; color: string; prefix: string }[] = [
    { id: 'orange', name: 'Orange Money', color: 'border-[#FF7900] bg-[#FF7900]/10 text-[#FF7900]', prefix: '07' },
    { id: 'mtn', name: 'MTN Mobile Money', color: 'border-[#FFCC00] bg-[#FFCC00]/15 text-[#D4A000]', prefix: '05' },
    { id: 'moov', name: 'Moov Money', color: 'border-[#006699] bg-[#006699]/10 text-[#006699]', prefix: '01' },
    { id: 'wave', name: 'Wave Côte d\'Ivoire', color: 'border-[#1DA1F2] bg-[#1DA1F2]/10 text-[#1DA1F2]', prefix: 'Tous' },
  ];

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Veuillez entrer un numéro de téléphone valide à 10 chiffres (ex: 07 08 12 34 56).');
      return;
    }

    setError('');
    setIsProcessing(true);
    setStep('waiting');

    // Simulate USSD push prompt on mobile phone
    setTimeout(() => {
      setStep('success');
      setIsProcessing(false);
      setSubscription(plan);
    }, 2800);
  };

  const handleClose = () => {
    setStep('input');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {step === 'input' && (
          <form onSubmit={handlePayment} className="flex flex-col gap-5">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary-container flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[28px]">payments</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface">
                Paiement Mobile Money
              </h3>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                Abonnement {plan === 'annual' ? 'Vendeur Pro (Annuel)' : 'Vendeur Pro (Mensuel)'} -{' '}
                <strong className="text-primary font-bold">{amount.toLocaleString('fr-FR')} FCFA</strong>
              </p>
            </div>

            {/* Operator Selection */}
            <div className="flex flex-col gap-2">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Choisissez votre opérateur
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {operators.map((op) => (
                  <button
                    type="button"
                    key={op.id}
                    onClick={() => setOperator(op.id)}
                    className={`p-3 rounded-xl border-2 text-left font-label text-sm font-semibold transition-all flex items-center gap-2 ${
                      operator === op.id
                        ? `${op.color} shadow-sm ring-2 ring-primary/20`
                        : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                      {operator === op.id && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                    </span>
                    <span className="truncate">{op.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Numéro de téléphone de débit
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-label text-sm text-on-surface-variant font-bold">
                  +225
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07 08 12 34 56"
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-3 pl-16 pr-4 font-body text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {error && <p className="text-xs text-error font-medium">{error}</p>}
            </div>

            <div className="bg-primary-fixed/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                lock
              </span>
              <span>
                Une notification USSD va s'afficher sur votre téléphone portable pour valider la transaction avec votre code secret.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-label text-sm font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <span>Valider le paiement ({amount.toLocaleString('fr-FR')} FCFA)</span>
            </button>
          </form>
        )}

        {step === 'waiting' && (
          <div className="py-8 flex flex-col items-center text-center gap-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-secondary-container/20 text-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px] animate-spin">
                hourglass_top
              </span>
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              En attente de validation sur votre téléphone...
            </h3>
            <p className="font-body text-sm text-on-surface-variant max-w-xs">
              Veuillez consulter votre mobile au <strong>+225 {phoneNumber}</strong> et confirmer avec votre code secret {operator.toUpperCase()}.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[36px]">check</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-primary">
              Paiement Confirmé avec Succès !
            </h3>
            <p className="font-body text-sm text-on-surface-variant max-w-xs">
              Félicitations ! Votre compte est désormais <strong>Vendeur Pro</strong>. Vous bénéficiez dès maintenant du badge vérifié et de la priorité sur vos annonces.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-label text-sm font-bold hover:bg-primary-container transition-all shadow-md mt-2"
            >
              Accéder à mon espace Vendeur Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
