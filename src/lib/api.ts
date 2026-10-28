import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'not-configured';
export const supabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

async function request(method: string, path: string, body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  const response = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error: any = new Error(data?.error || `Request failed (${response.status})`); error.response = { status: response.status, data }; throw error; }
  return { data };
}
export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body: unknown) => request('POST', path, body),
  put: (path: string, body: unknown) => request('PUT', path, body),
  delete: (path: string) => request('DELETE', path),
};
export const auth = {
  async signIn({ email }: { email: string }) {
    if (!supabaseConfigured) throw new Error('Owner sign-in setup is incomplete. Configure the Supabase URL and anon key in Netlify first.');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return { magicLinkSent: false, user: session.user };
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
    return { magicLinkSent: true, user: null };
  },
  async getUser() {
    if (!supabaseConfigured) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },
  async signOut() { await supabase.auth.signOut(); },
};
