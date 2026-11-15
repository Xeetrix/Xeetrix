import { NextRequest, NextResponse } from "next/server";
import { callMartScriptPost, getMartScriptUrlServer } from "@/lib/martServer";

export const dynamic = "force-dynamic";

interface IncomingOrderItem {
  productId?: string;
  sku?: string;
  name?: string;
  nameEn?: string;
  nameBn?: string;
  variant?: string;
  unitPrice?: number;
  quantity?: number;
  lineTotal?: number;
  imageUrl?: string;
  fulfillmentType?: string;
  itemStatus?: string;
}

export async function POST(req: NextRequest) {
  try {
    const scriptUrl = getMartScriptUrlServer();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          ok: false,
          code: "BACKEND_UNCONFIGURED",
          error:
            "Store checkout is currently being connected. Please call +880 965 803 6631 or email mart@xeetrix.com to complete your order.",
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      items?: IncomingOrderItem[];
      subtotal?: number;
      deliveryArea?: string;
      deliveryCharge?: number;
      totalAmount?: number;
      customerName?: string;
      phone?: string;
      address?: string;
      paymentMethod?: string;
      transactionId?: string;
      notes?: string;
    };

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const customerName = String(body.customerName || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const deliveryArea = String(body.deliveryArea || "Inside Dhaka").trim();
    const paymentMethod = String(body.paymentMethod || "Cash on Delivery").trim();

    if (rawItems.length === 0 || !customerName || !phone || !address) {
      return NextResponse.json(
        {
          ok: false,
          code: "MISSING_FIELDS",
          error: "Order items, customer name, phone number, and delivery address are required.",
        },
        { status: 400 }
      );
    }

    // Only keep safe storefront-submitted fields; Apps Script enriches authoritative costPrice/supplier on server
    const cleanItems = rawItems.map((item) => ({
      productId: String(item.productId || ""),
      sku: String(item.sku || ""),
      name: String(item.name || item.nameEn || item.nameBn || "Item"),
      nameEn: String(item.nameEn || item.name || "Item"),
      nameBn: String(item.nameBn || ""),
      variant: String(item.variant || ""),
      unitPrice: Number(item.unitPrice) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      lineTotal: Number(item.lineTotal) || (Number(item.unitPrice) || 0) * Math.max(1, Number(item.quantity) || 1),
      imageUrl: String(item.imageUrl || ""),
      fulfillmentType: item.fulfillmentType === "dropship" ? "dropship" : "own_stock",
      itemStatus: "Pending",
    }));

    const itemsSummary = cleanItems
      .map(
        (item) =>
          `${item.name}${item.variant ? ` (${item.variant})` : ""} × ${item.quantity}`
      )
      .join(", ");

    const totalItems = cleanItems.reduce((sum, item) => sum + item.quantity, 0);

    const res = await callMartScriptPost<{ id: string; record?: Record<string, unknown> }>(
      {
        action: "createRecord",
        sheet: "Mart_Orders",
        data: {
          itemsJson: JSON.stringify(cleanItems),
          itemsSummary,
          totalItems,
          subtotal: Number(body.subtotal) || 0,
          deliveryArea,
          deliveryCharge: Number(body.deliveryCharge) || 0,
          totalAmount: Number(body.totalAmount) || 0,
          customerName,
          phone,
          address,
          paymentMethod,
          transactionId: String(body.transactionId || "").trim(),
          notes: String(body.notes || "").trim(),
          status: "Pending",
        },
      },
      false
    );

    return NextResponse.json({
      ok: true,
      id: res.id,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        code: "GENERIC_NETWORK",
        error:
          err instanceof Error
            ? err.message
            : "Order could not be placed. Please call +880 965 803 6631.",
      },
      { status: 502 }
    );
  }
}
