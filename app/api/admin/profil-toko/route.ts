import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();

  const { data: brand } = await supabase
    .from("brand")
    .select("name, whatsapp_number")
    .eq("id", 1)
    .single();

  const { data: opHours } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "jam_operasional")
    .single();

  return NextResponse.json({
    name: brand?.name || "MENARA",
    whatsapp_number: brand?.whatsapp_number || "",
    jam_operasional: opHours?.value || "Senin–Sabtu · 09.00–17.00 WIB",
  });
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  const body = await req.json();
  const { name, whatsapp_number, jam_operasional } = body;

  const { error: brandErr } = await supabase
    .from("brand")
    .update({ name: name || "MENARA", whatsapp_number: whatsapp_number || "" })
    .eq("id", 1);

  if (brandErr) {
    return NextResponse.json({ error: brandErr.message }, { status: 500 });
  }

  const { error: opErr } = await supabase
    .from("app_settings")
    .upsert({ key: "jam_operasional", value: jam_operasional || "" }, { onConflict: "key" });

  if (opErr) {
    return NextResponse.json({ error: opErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
