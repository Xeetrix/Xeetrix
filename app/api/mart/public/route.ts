import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MART_SETTINGS } from "@/lib/martApi";
import { fetchMartPublicFromScript } from "@/lib/martServer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const forceFresh = req.nextUrl.searchParams.get("fresh") === "1";
  const result = await fetchMartPublicFromScript(forceFresh);

  if (!result.isLiveBackend || !result.data) {
    return NextResponse.json(
      {
        ok: true,
        isLiveBackend: false,
        error: result.error,
        data: {
          products: [],
          categories: [],
          labels: [],
          settings: DEFAULT_MART_SETTINGS,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  const sanitizedProducts = Array.isArray(result.data.products)
    ? result.data.products.map((raw) => {
        if (!raw || typeof raw !== "object") return raw;
        const p = { ...(raw as Record<string, unknown>) };
        delete p.costPrice;
        delete p.supplierId;
        delete p.sourceName;
        delete p.collectionMode;
        return p;
      })
    : [];

  return NextResponse.json(
    {
      ok: true,
      isLiveBackend: true,
      data: {
        products: sanitizedProducts,
        categories: Array.isArray(result.data.categories) ? result.data.categories : [],
        labels: Array.isArray(result.data.labels) ? result.data.labels : [],
        settings: {
          ...DEFAULT_MART_SETTINGS,
          ...(result.data.settings || {}),
        },
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
