import { NextResponse } from "next/server";

const AUTH_SECRET = process.env.PESANAN_PASSWORD || "menara2026";

export async function POST(request: Request) {
  const { password } = await request.json();

  // Trim dulu: spasi/newline yang kebawa dari autofill atau paste sering bikin gagal.
  const submitted = typeof password === "string" ? password.trim() : "";
  const expected = AUTH_SECRET.trim();

  if (submitted !== expected) {
    // Catat panjangnya saja (bukan isinya) biar gampang diagnosa lewat Vercel logs.
    console.warn("[pesanan-auth] mismatch", {
      receivedLength: submitted.length,
      expectedLength: expected.length,
    });
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("pesanan_auth", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
