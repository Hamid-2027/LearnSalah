import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPABASE CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Create a free project at https://supabase.com
 * 2. Get your URL and Anon Public Key from Project Settings > API
 * 3. Replace the placeholder values below or set EXPO_PUBLIC_SUPABASE_URL and
 *    EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.
 */
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

/**
 * Check if the developer has replaced the default placeholders with real keys
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_ANON_KEY.length > 20
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Extract tokens and parameters from OAuth redirect URL
 */
function extractParamsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hash = url.split('#')[1] || url.split('?')[1];
  if (!hash) return params;

  hash.split('&').forEach((item) => {
    const [key, value] = item.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return params;
}

/**
 * Sign in with Google using Supabase OAuth + expo-web-browser
 */
export async function signInWithGoogleOAuth() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured yet. Please enter your SUPABASE_URL and SUPABASE_ANON_KEY in src/services/supabase.ts'
    );
  }

  // Deep link that Supabase will redirect to AFTER it processes the OAuth callback.
  // This must also be registered in your Supabase Redirect URLs dashboard.
  const appDeepLink = 'salah786://auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appDeepLink,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No authorization URL returned from Supabase.');

  const res = await WebBrowser.openAuthSessionAsync(data.url, appDeepLink);

  if (res.type === 'success' && res.url) {
    const params = extractParamsFromUrl(res.url);
    if (params.access_token && params.refresh_token) {
      const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (sessionErr) throw sessionErr;
      return sessionData;
    }
  }

  return null;
}
