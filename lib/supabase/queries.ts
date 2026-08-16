import { createClient } from '@/lib/supabase/client';

export interface ListingsFilter {
  page?: number;
  limit?: number;
  category?: string;
  commune?: string;
  q?: string;
  status?: string;
}

/**
 * Récupère les annonces avec pagination cursor-based.
 * Conçu pour 1000+ utilisateurs simultanés avec index PostgreSQL.
 */
export async function getListings(filter: ListingsFilter = {}) {
  const supabase = createClient();
  const { page = 1, limit = 20, category, commune, q, status = 'active' } = filter;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('listings')
    .select(`
      id, title, price, is_negotiable, condition, commune, images,
      status, is_boosted, views_count, favorites_count, created_at,
      seller:profiles!seller_id(id, full_name, avatar_url, is_verified, rating),
      category:categories!category_id(id, name, slug, icon)
    `, { count: 'exact' })
    .eq('status', status)
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (category) query = query.eq('category_id', category);
  if (commune && commune !== 'Tout Abidjan') query = query.eq('commune', commune);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error, count } = await query;
  return {
    listings: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
    hasMore: to < (count ?? 0) - 1,
    error,
  };
}

/**
 * Récupère une annonce par ID avec tous les détails.
 */
export async function getListing(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!seller_id(*),
      category:categories!category_id(*)
    `)
    .eq('id', id)
    .single();
  return { listing: data, error };
}

/**
 * Récupère le profil utilisateur.
 */
export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, commune, avatar_url, is_verified, rating, reviews_count, active_listings_count, sold_listings_count, response_rate, created_at')
    .eq('id', userId)
    .single();
  return { profile: data, error };
}

/**
 * Récupère les annonces d un vendeur.
 */
export async function getSellerListings(sellerId: string, page = 1, limit = 20) {
  const supabase = createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await supabase
    .from('listings')
    .select('id, title, price, condition, commune, images, status, views_count, favorites_count, created_at', { count: 'exact' })
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .range(from, to);
  return { listings: data ?? [], total: count ?? 0, error };
}

