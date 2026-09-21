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
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [
      "deadline_notif_enabled",
      "deadline_notif_time",
      "deadline_notif_days",
      "deadline_notif_phones",
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const get = (key: string) => data?.find((s) => s.key === key)?.value || null;

  return NextResponse.json({
    enabled: get("deadline_notif_enabled") === "true",
    time: get("deadline_notif_time") || "08:00",
    days: get("deadline_notif_days") || "3,2,1",
    phones: get("deadline_notif_phones") || "",
  });
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  const body = await req.json();

  const { enabled, time, days, phones } = body;

  const settings = [
    { key: "deadline_notif_enabled", value: enabled ? "true" : "false" },
    { key: "deadline_notif_time", value: time || "08:00" },
    { key: "deadline_notif_days", value: days || "3,2,1" },
    { key: "deadline_notif_phones", value: phones || "" },
  ];

  for (const s of settings) {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: s.key, value: s.value }, { onConflict: "key" });
    if (error) {
      return NextResponse.json({ error: error.message, debug: { key: s.key, value: s.value } }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}