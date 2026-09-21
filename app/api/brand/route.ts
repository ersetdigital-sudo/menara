import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { WA_NUMBER } from "@/lib/data";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("brand")
    .select("name, whatsapp_number, tagline")
    .eq("id", 1)
    .single();
  // Fallback memakai nomor resmi, bukan nomor contoh — tombol "Hubungi CS"
  // tidak boleh mengarah ke orang yang salah saat database tidak terjangkau.
  return NextResponse.json(data || { name: "MENARA", whatsapp_number: WA_NUMBER });
}
