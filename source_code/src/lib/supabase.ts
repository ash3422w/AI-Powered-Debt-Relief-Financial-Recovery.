import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const EDGE_FUNCTION_BASE = `${supabaseUrl}/functions/v1`;

export async function callEdgeFunction<T = unknown>(
  slug: string,
  body: Record<string, unknown> = {},
  method: 'POST' | 'GET' = 'POST'
): Promise<T> {
  const { data: session } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: supabaseAnonKey,
  };
  if (session?.session?.access_token) {
    headers.Authorization = `Bearer ${session.session.access_token}`;
  } else {
    headers.Authorization = `Bearer ${supabaseAnonKey}`;
  }

  const res = await fetch(`${EDGE_FUNCTION_BASE}/${slug}`, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      message = err.error || err.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data as T;
}
