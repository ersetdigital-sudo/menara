import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllOrders, generateOrderNumber } from "@/lib/queries-orders";

/**
 * GET /api/admin/orders — list all orders (admin only)
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getAllOrders();
  return NextResponse.json(orders);
}

/**
 * POST /api/admin/orders — create new order (admin only)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderNumber = await generateOrderNumber();

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        product_type: body.productType || "jersey",
        quantity: body.quantity || 1,
        sizes: body.sizes || "",
        custom_name: body.customName || "",
        custom_number: body.customNumber || "",
        design_notes: body.designNotes || "",
        current_status: "order_diterima",
        current_stage: 1,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Insert initial status history
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "order_diterima",
      note: "Pesanan berhasil dibuat",
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
