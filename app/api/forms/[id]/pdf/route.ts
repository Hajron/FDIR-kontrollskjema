import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseForRoute } from '@/lib/supabase/route';
import { FormPdf } from '@/lib/pdf/FormPdf';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseForRoute(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: form, error: fe } = await supabase.from('forms').select('*').eq('id', params.id).single();
    if (fe || !form) return NextResponse.json({ error: fe?.message || 'Not found' }, { status: 404 });

    const { data: sections, error: se } = await supabase.from('form_sections').select('*').eq('form_id', params.id).order('section_key');
    if (se) return NextResponse.json({ error: se.message }, { status: 400 });

    const stream = await renderToStream(React.createElement(FormPdf, { form, sections }));
    return new Response(stream as any, { headers: { 'Content-Type': 'application/pdf' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'internal error' }, { status: 500 });
  }
}
