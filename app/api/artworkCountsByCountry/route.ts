import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

export const runtime = 'nodejs';

function parseYear(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
  }

  const url = new URL(request.url);
  const start_year = parseYear(url.searchParams.get('start_year'));
  const end_year = parseYear(url.searchParams.get('end_year'));

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase.rpc('get_artwork_counts_by_country', { start_year, end_year });

  if (error) {
    console.error('Error fetching artwork counts by country:', error);
    return NextResponse.json({ error: 'Failed to fetch artwork counts' }, { status: 500 });
  }

  return NextResponse.json(data || [], {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}

