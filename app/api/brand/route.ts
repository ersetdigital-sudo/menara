import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  return NextResponse.json(data || { name: "MENARA", whatsapp_number: "628115491117" });
}
