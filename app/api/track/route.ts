import { NextRequest, NextResponse } from "next/server";
import { getOrderByTracking } from "@/lib/queries-orders";
import { signToken, buildSetCookie } from "@/lib/verify-token";

/**
 * POST /api/track
 * Verify order number + phone and return order data + history.
 * Returns a signed token in the response body for client-side session persistence.
 * (Set-Cookie is also sent but may be lost due to middleware creating a new response.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, phone } = body;

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { error: "Nomor pesanan dan nomor HP wajib diisi" },
        { status: 400 }
      );
    }

    const result = await getOrderByTracking(orderNumber, phone);

    if (!result) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan atau nomor HP tidak cocok" },
        { status: 404 }
      );
    }

    // Return token in body so client can store in sessionStorage
    const token = signToken(orderNumber);
    const response = NextResponse.json({ ...result, token });
    response.headers.append("Set-Cookie", buildSetCookie(orderNumber));
    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
