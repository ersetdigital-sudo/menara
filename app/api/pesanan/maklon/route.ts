import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAKLON_STATUS_LIST = [
  "layout",
  "profing_warna",
  "cutting_bahan",
  "press_sublime",
  "qc",
  "kirim",
];

const MAKLON_STEP_PROGRESS: Record<number, number> = {
  1: 17,
  2: 33,
  3: 50,
  4: 67,
  5: 83,
  6: 100,
};

function getProgress(step: number, hasTracking: boolean): number {
  if (step === 6 && hasTracking) return 100;
  return MAKLON_STEP_PROGRESS[step] ?? 0;
}

function mapOrder(row: any) {
  const hasTracking = !!(row.tracking_number && row.courier);
  const step = row.current_stage || 1;
  const pct = getProgress(step, hasTracking);
  return {
    id: row.order_number,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    customer_city: row.customer_city || "",
    product_name: row.product_type || "",
    quantity: row.quantity ? `${row.quantity} pcs` : "-",
    material: row.material || "",
    sizes: row.sizes || "",
    design_photos: Array.isArray(row.design_photos)
      ? row.design_photos.map((p: any) => (typeof p === "string" ? p : p.url || "")).filter(Boolean)
      : [],
    wo_photos: Array.isArray(row.wo_photos)
      ? row.wo_photos.map((p: any) => (typeof p === "string" ? p : p.url || "")).filter(Boolean)
      : [],
    products: Array.isArray(row.products) ? row.products : [],
    current_step: step,
    note: row.design_notes || "",
    note_time: row.updated_at || "",
    courier: row.courier || "",
    tracking_number: row.tracking_number || "",
    is_done: row.current_status === "selesai" || (step === 6 && hasTracking),
    deadline: row.deadline || null,
    created_at: row.created_at,
    pct,
  };
}

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(
    supabaseUrl,
    serviceKey || anonKey,
    serviceKey ? { auth: { persistSession: false } } : undefined
  );
}

const CHARSET = "ACDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(len = 4): string {
  let code = "";
  for (let i = 0; i < len; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

function jakartaDatePart(date = new Date()): string {
  const jkt = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const yy = String(jkt.getFullYear()).slice(-2);
  const mm = String(jkt.getMonth() + 1).padStart(2, "0");
  const dd = String(jkt.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

async function generateMaklonNumber(supabase: any): Promise<string> {
  const datePart = jakartaDatePart();
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `MKL${datePart}${randomCode()}`;
    const { data } = await supabase
      .from("maklon_orders")
      .select("order_number")
      .eq("order_number", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  throw new Error("Gagal generate nomor maklon unik");
}

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("maklon_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: (data || []).map(mapOrder) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    id,
    customer_name,
    customer_phone,
    customer_city,
    product_name,
    quantity,
    material,
    sizes,
    deadline,
    created_at,
    design_photos,
    wo_photos,
    products,
  } = body;

  if (!customer_name || !customer_phone) {
    return NextResponse.json(
      { error: "Nama customer dan HP wajib diisi" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  let orderNumber = id ? String(id).trim().toUpperCase() : "";
  if (!orderNumber) {
    try {
      orderNumber = await generateMaklonNumber(supabase);
    } catch {
      return NextResponse.json(
        { error: "Gagal generate nomor maklon, coba lagi" },
        { status: 500 }
      );
    }
  }

  const qtyNum = parseInt(quantity, 10);

  const insertData: Record<string, any> = {
    order_number: orderNumber,
    customer_name,
    customer_phone,
    product_type: product_name || "",
    quantity: isNaN(qtyNum) ? 1 : qtyNum,
    sizes: sizes || "",
    current_status: "layout",
    current_stage: 1,
    design_photos: design_photos || [],
    wo_photos: Array.isArray(wo_photos) ? wo_photos : [],
    products: Array.isArray(products) ? products : [],
  };
  if (customer_city) insertData.customer_city = customer_city;
  if (material) insertData.material = material;
  if (deadline) insertData.deadline = deadline;
  if (created_at) insertData.created_at = created_at;

  const { data, error } = await supabase
    .from("maklon_orders")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: mapOrder(data) }, { status: 201 });
}