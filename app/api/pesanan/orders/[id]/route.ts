import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const jar = await cookies();
  if (jar.get("pesanan_auth")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: existing, error: fetchErr } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const { error: orderErr } = await supabase
    .from("orders")
    .delete()
    .eq("order_number", id);

  if (orderErr) {
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
