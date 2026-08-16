import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { invalidateSettingsCache } from '@/lib/monetization/config';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 'singleton')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // Vérifier rôle admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await request.json();
  const { error } = await supabase
    .from('app_settings')
    .update({ ...body, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', 'singleton');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidateSettingsCache();
  return NextResponse.json({ success: true });
}

