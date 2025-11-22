import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute } from '@/lib/supabase/route';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseForRoute(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { section_key, data } = await req.json();

    const { data: upserted, error } = await supabase
      .from('form_sections')
      .upsert({ form_id: params.id, section_key, data, updated_at: new Date().toISOString() }, { onConflict: 'form_id,section_key' })
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: upserted });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}
