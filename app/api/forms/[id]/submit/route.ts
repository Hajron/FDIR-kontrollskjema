import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute } from '@/lib/supabase/route';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseForRoute(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('forms')
      .update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}
