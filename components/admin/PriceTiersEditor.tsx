"use client";

import { Plus, Trash2 } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/lib/constants";

export type PriceTierRow = { minQty: string; price: string };

const emptyRow: PriceTierRow = { minQty: "", price: "" };

/**
 * Bulk/MOQ pricing editor: "Tier 1: MOQ 100 @ ৳165", "Tier 2: MOQ 200 @
 * ৳160", etc. Values are kept as strings while editing (like any other
 * number input) and only coerced to numbers on submit, so a field can be
 * briefly empty without fighting the input.
 */
export function PriceTiersEditor({
  value,
  onChange,
}: {
  value: PriceTierRow[];
  onChange: (rows: PriceTierRow[]) => void;
}) {
  const rows = value.length > 0 ? value : [emptyRow];

  function updateRow(index: number, patch: Partial<PriceTierRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([...rows, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  }

  // Purely a display hint: which row currently reads as the cheapest/entry
  // tier, so the admin can see which one becomes the storefront "from" price.
  const lowestIndex = rows.reduce((lowest, row, i) => {
    const qty = Number(row.minQty);
    const lowestQty = Number(rows[lowest]?.minQty);
    if (!row.minQty || Number.isNaN(qty)) return lowest;
    if (lowest === -1 || Number.isNaN(lowestQty) || qty < lowestQty) return i;
    return lowest;
  }, -1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-700">Bulk Price Tiers</span>
        <span className="text-xs text-ink-400">Lowest MOQ tier sets the storefront price</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="hidden grid-cols-[1fr_1fr_auto] gap-3 px-1 text-xs font-medium uppercase tracking-wide text-ink-400 sm:grid">
          <span>Min Quantity</span>
          <span>Price ({CURRENCY_SYMBOL})</span>
          <span className="w-9" />
        </div>

        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
            <div className="flex flex-col gap-1">
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="e.g. 100"
                value={row.minQty}
                onChange={(e) => updateRow(index, { minQty: e.target.value })}
                className="input"
              />
              {index === lowestIndex && rows.length > 1 && (
                <span className="text-[11px] font-medium text-brand-600">Starting tier</span>
              )}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                {CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 165"
                value={row.price}
                onChange={(e) => updateRow(index, { price: e.target.value })}
                className="input pl-7"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length <= 1}
              className="flex h-10 w-9 flex-shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-400"
              aria-label={`Remove tier ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-ink-300 px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700"
      >
        <Plus className="h-4 w-4" />
        Add Bulk Price Tier
      </button>
    </div>
  );
}
