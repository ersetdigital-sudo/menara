import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware — delegates entirely to the Supabase session handler.
 *
 * The matcher skips Next internals, static assets, and image/optimize
 * paths so Supabase auth cookies are only refreshed on real navigations.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except those starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, logo.svg, etc. (public assets)
     * - opengraph-image (route handler)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|opengraph-image).*)",
  ],
};
