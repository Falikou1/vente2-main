import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/v1/listings
 * Endpoint REST pour les listings — utilisé par la future app mobile.
 *
 * Query params: page, limit, category, commune, q, status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50); // max 50
  const category = searchParams.get('category') ?? undefined;
  const commune = searchParams.get('commune') ?? undefined;
  const q = searchParams.get('q') ?? undefined;
  const status = searchParams.get('status') ?? 'active';

  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('listings')
    .select(`
      id, title, price, is_negotiable, condition, commune, images,
      status, is_boosted, views_count, favorites_count, created_at,
      seller:profiles!seller_id(id, full_name, avatar_url, is_verified),
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    meta: {
      page,
      limit,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limit),
      has_more: to < (count ?? 0) - 1,
    },
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}

