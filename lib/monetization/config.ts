import { createClient } from '@/lib/supabase/client';

export interface AppSettings {
  monetization_enabled: boolean;
  price_per_listing: number;
  price_weekly: number;
  price_monthly: number;
}

// Valeurs par défaut (utilisées si Supabase inaccessible ou monétisation absente)
const DEFAULT_SETTINGS: AppSettings = {
  monetization_enabled: false,
  price_per_listing: 500,
  price_weekly: 2000,
  price_monthly: 6000,
};

let cachedSettings: AppSettings | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

/**
 * Récupère les paramètres de l application depuis Supabase.
 * Utilise un cache en mémoire de 1 minute pour réduire les requêtes.
 */
export async function getAppSettings(): Promise<AppSettings> {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiry) return cachedSettings;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('monetization_enabled, price_per_listing, price_weekly, price_monthly')
      .eq('id', 'singleton')
      .single();

    if (error || !data) return DEFAULT_SETTINGS;

    cachedSettings = data as AppSettings;
    cacheExpiry = now + CACHE_TTL_MS;
    return cachedSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function invalidateSettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}

/**
 * Vérifie si la monétisation est activée.
 * Retourne false par défaut (gratuit au lancement).
 */
export async function isMonetizationEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.monetization_enabled;
}

/**
 * Retourne le tarif pour un plan donné en FCFA.
 */
export async function getPlanPrice(plan: 'per_listing' | 'weekly' | 'monthly'): Promise<number> {
  const settings = await getAppSettings();
  switch (plan) {
    case 'per_listing': return settings.price_per_listing;
    case 'weekly':      return settings.price_weekly;
    case 'monthly':     return settings.price_monthly;
    default:            return 0;
  }
}

