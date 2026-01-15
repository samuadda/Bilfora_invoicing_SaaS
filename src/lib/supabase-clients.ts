import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase URL or Anon Key");
}

/**
 * Persistent client → uses Cookies
 * Used for standard interaction with Supabase where Middleware protection is needed.
 */
export const supabasePersistent = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Session client → Redirects to Persistent client
 * Maintaining export for backward compatibility, but since we are using Cookies (which are domain-wide),
 * distinct storage strategies (localStorage vs sessionStorage) are less relevant for Middleware auth.
 * Both will now effectively use the same cookie-based session.
 */
export const supabaseSession = createBrowserClient(supabaseUrl, supabaseAnonKey);

