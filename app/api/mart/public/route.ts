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
          attributes: [],
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
        if (typeof p.variationMatrixJson === "string" && p.variationMatrixJson.trim()) {
          try {
            const matrix = JSON.parse(p.variationMatrixJson);
            if (Array.isArray(matrix)) {
              p.variationMatrixJson = JSON.stringify(
                matrix.map((cell) => {
                  if (!cell || typeof cell !== "object") return cell;
                  const cleanCell = { ...(cell as Record<string, unknown>) };
                  delete cleanCell.costOverride;
                  return cleanCell;
                })
              );
            }
          } catch {
            // Keep existing value if unparseable
          }
        }
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
        attributes: Array.isArray(result.data.attributes) ? result.data.attributes : [],
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
