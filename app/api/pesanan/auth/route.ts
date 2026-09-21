import { NextResponse } from "next/server";

const AUTH_SECRET = process.env.PESANAN_PASSWORD || "menara2026";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password !== AUTH_SECRET) {
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
