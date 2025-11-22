import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute } from '@/lib/supabase/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseForRoute(req);

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    let body: any = {};
    try { body = await req.json(); } catch {}
    const { form_type, title } = body ?? {};
    if (form_type !== 'KS0322' && form_type !== 'KS0319') {
      return NextResponse.json({ error: 'form_type must be KS0322 or KS0319' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('forms')
      .insert({ owner_id: user.id, form_type, title })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseForRoute(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}
