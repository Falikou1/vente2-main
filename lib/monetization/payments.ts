import { createClient } from '@/lib/supabase/client';

export type PaymentOperator = 'orange' | 'mtn' | 'moov' | 'wave';
export type PaymentPlan = 'per_listing' | 'weekly' | 'monthly' | 'annual';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  user_id: string;
  plan_type: PaymentPlan;
  amount: number;
  transaction_reference?: string;
  payment_operator?: PaymentOperator;
  phone_number?: string;
  status: PaymentStatus;
  listing_id?: string;
  paid_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface CreatePaymentInput {
  plan_type: PaymentPlan;
  amount: number;
  payment_operator?: PaymentOperator;
  phone_number?: string;
  listing_id?: string;
}

/**
 * Crée un enregistrement de paiement en base (statut initial: pending).
 * Appelez cette fonction AVANT de déclencher le vrai paiement.
 */
export async function createPaymentRecord(input: CreatePaymentInput): Promise<Payment | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Calcul de la date d expiration selon le plan
  const expiresAt = computeExpiry(input.plan_type);

  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      plan_type: input.plan_type,
      amount: input.amount,
      payment_operator: input.payment_operator ?? null,
      phone_number: input.phone_number ?? null,
      listing_id: input.listing_id ?? null,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error('[payments] createPaymentRecord error:', error);
    return null;
  }
  return data as Payment;
}

/**
 * Met à jour le statut d un paiement (ex: après confirmation opérateur).
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  transactionReference?: string
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('payments')
    .update({
      status,
      transaction_reference: transactionReference ?? null,
      paid_at: status === 'success' ? new Date().toISOString() : null,
    })
    .eq('id', paymentId);

  if (error) {
    console.error('[payments] updatePaymentStatus error:', error);
    return false;
  }
  return true;
}

/**
 * Récupère les paiements de l utilisateur connecté.
 */
export async function getUserPayments(): Promise<Payment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []) as Payment[];
}

// ---------- Helpers ----------

function computeExpiry(plan: PaymentPlan): string | null {
  const now = new Date();
  switch (plan) {
    case 'per_listing': {
      // 30 jours de validité pour l annonce payée
      now.setDate(now.getDate() + 30);
      return now.toISOString();
    }
    case 'weekly': {
      now.setDate(now.getDate() + 7);
      return now.toISOString();
    }
    case 'monthly': {
      now.setMonth(now.getMonth() + 1);
      return now.toISOString();
    }
    case 'annual': {
      now.setFullYear(now.getFullYear() + 1);
      return now.toISOString();
    }
    default:
      return null;
  }
}

