import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { triggerMaklonStageNotification } from "@/lib/fonnte";

const STATUS_FROM_STEP = [
  "layout",
  "profing_warna",
  "cutting_bahan",
  "press_sublime",
  "qc",
  "kirim",
];

/** Tahap terakhir (6, "Kirim") = tahap yang bikin order langsung tuntas. */
const FINAL_STEP = STATUS_FROM_STEP.length;

function statusFromStep(step: number): string {
  return STATUS_FROM_STEP[Math.min(Math.max(step, 1), 6) - 1] || "layout";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    current_step,
    note,
    courier,
    tracking_number,
    deadline,
    wo_photos,
    customer_name,
    customer_phone,
    design_photos,
  } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(
    supabaseUrl,
    serviceKey || anonKey,
    serviceKey ? { auth: { persistSession: false } } : undefined
  );

  const { data: existing, error: fetchError } = await supabase
    .from("maklon_orders")
    .select("*")
    .eq("order_number", id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Pesanan maklon tidak ditemukan" }, { status: 404 });
  }

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (current_step !== undefined) {
    const newStage = Math.min(Math.max(Number(current_step), 1), 6);
    updateData.current_stage = newStage;
    // Tahap akhir = maklon TUNTAS: status langsung "selesai", tanpa wajib nomor
    // resi. Resi/ekspedisi tetap opsional — kalau diisi, halaman tracking maklon
    // tetap menampilkan baris pengirimannya.
    if (newStage === FINAL_STEP) {
      updateData.current_status = "selesai";
    } else {
      updateData.current_status = statusFromStep(newStage);
    }
  }
  if (note !== undefined) updateData.design_notes = note;
  if (courier !== undefined) updateData.courier = courier;
  if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
  if (deadline !== undefined) updateData.deadline = deadline || null;
  if (wo_photos !== undefined) updateData.wo_photos = Array.isArray(wo_photos) ? wo_photos : [];
  if (Array.isArray(body.products)) updateData.products = body.products;
  if (body.product_name !== undefined) updateData.product_type = body.product_name;
  if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity, 10) || 0;
  if (body.sizes !== undefined) updateData.sizes = body.sizes;
  if (body.created_at !== undefined) updateData.created_at = body.created_at;
  if (customer_name !== undefined) updateData.customer_name = customer_name;
  if (customer_phone !== undefined) updateData.customer_phone = customer_phone;
  if (design_photos !== undefined) updateData.design_photos = Array.isArray(design_photos) ? design_photos : [];

  const { data: updatedOrder, error: updateError } = await supabase
    .from("maklon_orders")
    .update(updateData)
    .eq("order_number", id)
    .select("id")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (current_step !== undefined && updatedOrder) {
    // History harus sama persis dengan status yang tersimpan
    // (tahap akhir = "selesai").
    const statusValue = updateData.current_status ?? statusFromStep(Number(current_step));
    await supabase.from("maklon_status_history").insert({
      order_id: updatedOrder.id,
      status: statusValue,
      note: note || "",
    });
  }

  const previousStage = existing.current_stage ?? null;
  const newStage = current_step !== undefined ? Math.min(Math.max(Number(current_step), 1), 6) : null;
  const notification: { stage: number | null; status: string } = { stage: newStage, status: "none" };

  if (updatedOrder && newStage !== null && newStage !== previousStage) {
    notification.status = await triggerMaklonStageNotification(
      supabase,
      updatedOrder.id,
      {
        customer_name: existing.customer_name,
        order_number: existing.order_number,
        customer_phone: existing.customer_phone,
      },
      newStage
    );
  } else if (newStage !== null && newStage === previousStage) {
    notification.status = "skipped_same_stage";
  }

  return NextResponse.json({ ok: true, notification });
}