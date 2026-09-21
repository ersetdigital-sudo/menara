/**
 * Supabase session middleware.
 *
 * Runs on every matched request. Does two things:
 *  1. Refreshes the user's session by updating the auth cookie — required
 *     so Server Components see the latest session without a hard reload.
 *  2. Guards `/admin/*` routes (except `/admin/login`): unauthenticated
 *     users are redirected to `/admin/login?next=<original-path>`.
 *
 * Imported by the root middleware.ts, which calls `updateSession` and
 * returns its response.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Supabase not configured (e.g. preview/local without env vars) —
  // skip session handling entirely so the public site still renders
  // from the static fallbacks in lib/data.ts.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  // Build a Supabase client bound to this request/response pair so cookie
  // updates flow through the response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() refreshes the session token server-side and returns the user.
  // Do NOT replace with getSession() — that reads the JWT without refreshing.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdmin = PUBLIC_ADMIN_PATHS.some((p) => pathname === p);

  // Redirect authenticated users away from auth pages.
  if (user && (pathname === "/admin/login" || pathname === "/admin/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Block unauthenticated access to protected admin routes.
  if (isAdminRoute && !isPublicAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Stamp the pathname into a response header so the admin layout
  // (which runs in the Node runtime, not the edge) can read it to
  // detect the login page and skip the auth guard there.
  response.headers.set("x-pathname", pathname);

  return response;
}