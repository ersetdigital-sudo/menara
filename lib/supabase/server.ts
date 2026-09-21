/**
 * Server-side Supabase client.
 *
 * Uses `createServerClient` from @supabase/ssr with Next.js cookies().
 * Safe to use in Server Components, Route Handlers, and Server Actions.
 *
 * This client is per-request: call `createClient()` inside each function
 * that needs it — do not share across requests.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** True when the Supabase env vars are present. */
export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
            // See lib/supabase/middleware.ts.
          }
        },
      },
    }
  );
}
