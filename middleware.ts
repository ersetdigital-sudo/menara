import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Root middleware — sengaja SELF-CONTAINED (tanpa import alias `@/...`).
 *
 * Kenapa: middleware di-deploy sebagai berkas tersendiri, dan pada build
 * production berkas itu bisa di-emit mentah. Kalau dia mengimpor `@/lib/...`
 * (alias tsconfig), Node tidak bisa me-resolve-nya dan semua request gagal
 * dengan MIDDLEWARE_INVOCATION_FAILED. Karena itu logika session Supabase
 * ada langsung di sini, dan hanya mengimpor paket npm biasa (@supabase/ssr)
 * serta next/server.
 *
 * Yang dilakukan:
 *  1. Refresh session Supabase lewat cookie (supaya Server Component selalu
 *     membaca session terbaru tanpa hard reload).
 *  2. Jaga rute `/admin/*` (kecuali `/admin/login` dan `/admin/signup`).
 *  3. Menitipkan pathname ke header `x-pathname` supaya layout server
 *     (mis. app/pesanan/layout.tsx) tahu halaman apa yang sedang dibuka.
 */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Simpan di variabel lokal supaya tipenya ter-narrow dengan benar.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase belum dikonfigurasi (mis. preview tanpa env var) — lewati
  // penanganan session supaya halaman tetap render dari data fallback.
  if (!supabaseUrl || !supabaseAnonKey) {
    const pathname = request.nextUrl.pathname;
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  // getUser() me-refresh token server-side. Jangan diganti getSession() —
  // itu cuma membaca JWT tanpa refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdmin = PUBLIC_ADMIN_PATHS.some((p) => pathname === p);

  // User yang sudah login tidak perlu melihat halaman login/signup.
  if (user && (pathname === "/admin/login" || pathname === "/admin/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Blokir akses tanpa login ke rute admin yang dilindungi.
  if (isAdminRoute && !isPublicAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Semua path kecuali:
     * - _next/static, _next/image (aset internal)
     * - favicon & aset publik lain
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|logo.svg|logo-menara.png|opengraph-image).*)",
  ],
};
