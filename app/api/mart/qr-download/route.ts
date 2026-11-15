import { NextRequest, NextResponse } from "next/server";
import { normalizeMartImageUrl } from "@/lib/martApi";
import { fetchMartPublicFromScript } from "@/lib/martServer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const typeParam = (req.nextUrl.searchParams.get("type") || "").trim().toLowerCase();
  if (typeParam !== "bkash" && typeParam !== "bangla") {
    return NextResponse.json(
      { ok: false, error: "Invalid QR type. Expected bkash or bangla." },
      { status: 400 }
    );
  }

  const pub = await fetchMartPublicFromScript(false);
  if (!pub.isLiveBackend || !pub.data || !pub.data.settings) {
    return NextResponse.json(
      { ok: false, error: "QR code settings unavailable." },
      { status: 404 }
    );
  }

  const rawUrl =
    typeParam === "bkash"
      ? String(pub.data.settings.bkashQrUrl || "")
      : String(pub.data.settings.banglaQrUrl || "");
  const resolvedUrl = normalizeMartImageUrl(rawUrl);

  if (
    !resolvedUrl ||
    (!resolvedUrl.startsWith("https://") && !resolvedUrl.startsWith("http://"))
  ) {
    return NextResponse.json(
      { ok: false, error: "Configured QR image not found." },
      { status: 404 }
    );
  }

  try {
    const imgRes = await fetch(resolvedUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });

    if (!imgRes.ok) {
      throw new Error(`QR fetch HTTP ${imgRes.status}`);
    }

    const contentType = (imgRes.headers.get("content-type") || "image/png").toLowerCase();
    let ext = "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      ext = "jpg";
    } else if (contentType.includes("webp")) {
      ext = "webp";
    }

    const buffer = await imgRes.arrayBuffer();
    const filename = `xeetrix-${typeParam === "bkash" ? "bkash-merchant" : "bangla"}-qr.${ext}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType.startsWith("image/") ? contentType : "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unable to download QR image.",
      },
      { status: 502 }
    );
  }
}
