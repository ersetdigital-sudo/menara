import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  const supabase = getSupabase();
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);

  const { data, error } = await supabase
    .from("notification_logs")
    .select("id, order_number, phone, status, error, diff_days, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: data || [] });
}
