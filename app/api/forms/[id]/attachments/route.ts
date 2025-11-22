import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute } from '@/lib/supabase/route';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseForRoute(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { path, mime, size } = await req.json();

    const { data, error } = await supabase
      .from('attachments')
      .insert({ form_id: params.id, path, mime, size })
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}
