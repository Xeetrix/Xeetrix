import { NextRequest, NextResponse } from "next/server";
import { callMartScriptPost, getMartScriptUrlServer, MartScriptError } from "@/lib/martServer";
import { MART_CONTACT_EMAIL, MART_CONTACT_PHONE } from "@/lib/martApi";

export const dynamic = "force-dynamic";

interface IncomingOrderItem {
  productId?: string;
  sku?: string;
  name?: string;
  nameEn?: string;
  nameBn?: string;
  variant?: string;
  colorName?: string;
  sizeName?: string;
  variantSku?: string;
  isWholesale?: boolean;
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
          error: `Store checkout is currently being connected. Please call ${MART_CONTACT_PHONE} or email ${MART_CONTACT_EMAIL} to complete your order.`,
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      items?: IncomingOrderItem[];
      subtotal?: number;
      discountCode?: string;
      discountAmount?: number;
      deliveryArea?: string;
      deliveryCharge?: number;
      totalAmount?: number;
      customerName?: string;
      phone?: string;
      address?: string;
      paymentMethod?: string;
      paymentProvider?: string;
      transactionId?: string;
      notes?: string;
    };

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const customerName = String(body.customerName || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const deliveryArea = String(body.deliveryArea || "Inside Dhaka").trim();
    const paymentMethod = String(body.paymentMethod || "Cash on Delivery").trim();
    const paymentProvider = String(body.paymentProvider || "").trim();
    const discountCode = String(body.discountCode || "").trim().toUpperCase();
    const discountAmount = Math.max(0, Number(body.discountAmount) || 0);

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

    // Only keep safe storefront-submitted fields; Apps Script enriches authoritative costPrice/supplier/pricing/coupon on server
    const cleanItems = rawItems.map((item) => ({
      productId: String(item.productId || ""),
      sku: String(item.sku || ""),
      name: String(item.name || item.nameEn || item.nameBn || "Item"),
      nameEn: String(item.nameEn || item.name || "Item"),
      nameBn: String(item.nameBn || ""),
      variant: String(item.variant || ""),
      colorName: String(item.colorName || ""),
      sizeName: String(item.sizeName || ""),
      variantSku: String(item.variantSku || ""),
      isWholesale: Boolean(item.isWholesale),
      unitPrice: Number(item.unitPrice) || 0,
      quantity: Math.max(1, Number(item.quantity) || 1),
      lineTotal:
        Number(item.lineTotal) ||
        (Number(item.unitPrice) || 0) * Math.max(1, Number(item.quantity) || 1),
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
          subtotal: Math.max(0, Number(body.subtotal) || 0),
          discountCode,
          discountAmount,
          deliveryArea,
          deliveryCharge: Math.max(0, Number(body.deliveryCharge) || 0),
          totalAmount: Math.max(0, Number(body.totalAmount) || 0),
          customerName,
          phone,
          address,
          paymentMethod,
          paymentProvider,
          transactionId: String(body.transactionId || "").trim(),
          notes: String(body.notes || "").trim(),
          status: "Pending",
        },
      },
      false
    );

    let safeRecord: Record<string, unknown> | undefined = undefined;
    if (res.record && typeof res.record === "object") {
      safeRecord = { ...res.record };
      if (typeof safeRecord.itemsJson === "string") {
        try {
          const parsed = JSON.parse(safeRecord.itemsJson);
          if (Array.isArray(parsed)) {
            safeRecord.itemsJson = JSON.stringify(
              parsed.map((it: Record<string, unknown>) => ({
                productId: it.productId,
                sku: it.sku,
                name: it.name,
                nameEn: it.nameEn,
                nameBn: it.nameBn,
                variant: it.variant,
                colorName: it.colorName,
                sizeName: it.sizeName,
                variantSku: it.variantSku,
                isWholesale: it.isWholesale,
                unitPrice: it.unitPrice,
                quantity: it.quantity,
                lineTotal: it.lineTotal,
                imageUrl: it.imageUrl,
                itemStatus: it.itemStatus,
              }))
            );
          }
        } catch {
          // Leave intact if unparseable
        }
      }
    }

    return NextResponse.json({
      ok: true,
      id: res.id,
      ...(safeRecord ? { record: safeRecord } : {}),
    });
  } catch (err) {
    const scriptErr = err instanceof MartScriptError ? err : null;
    const status =
      scriptErr?.code === "OUT_OF_STOCK" || scriptErr?.code === "VARIANT_UNAVAILABLE"
        ? 409
        : scriptErr?.code === "MISSING_FIELDS"
        ? 400
        : scriptErr?.status || 502;
    return NextResponse.json(
      {
        ok: false,
        code: scriptErr?.code || "GENERIC_NETWORK",
        error:
          err instanceof Error
            ? err.message
            : "Order could not be placed. Please call +880 965 803 6631.",
      },
      { status }
    );
  }
}
