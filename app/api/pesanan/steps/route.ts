import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** GET — fetch all steps ordered by position */
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("production_steps")
    .select("*")
    .order("position", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ steps: data });
}

/** PUT — replace all steps (atomic: delete + re-insert) */
export async function PUT(req: Request) {
  const supabase = getSupabase();
  const { steps } = (await req.json()) as {
    steps: { name: string; position: number }[];
  };

  if (!steps || !Array.isArray(steps) || steps.length < 2) {
    return NextResponse.json(
      { error: "Minimal harus ada 2 tahap." },
      { status: 400 }
    );
  }

  const names = steps.map((s) => s.name.trim());
  if (names.some((n) => !n)) {
    return NextResponse.json(
      { error: "Nama tahap tidak boleh kosong." },
      { status: 400 }
    );
  }
  if (new Set(names).size !== names.length) {
    return NextResponse.json(
      { error: "Nama tahap tidak boleh duplikat." },
      { status: 400 }
    );
  }

  const { error: delErr } = await supabase
    .from("production_steps")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  const rows = steps.map((s) => ({
    name: s.name.trim(),
    position: s.position,
  }));

  const { error: insErr } = await supabase.from("production_steps").insert(rows);
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
