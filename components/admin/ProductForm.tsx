"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { MultiImageDropzone } from "@/components/admin/MultiImageDropzone";
import { PriceTiersEditor, type PriceTierRow } from "@/components/admin/PriceTiersEditor";
import { CURRENCY_SYMBOL } from "@/lib/constants";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [priceTiers, setPriceTiers] = useState<PriceTierRow[]>(
    product?.priceTiers && product.priceTiers.length > 0
      ? product.priceTiers.map((t) => ({ minQty: String(t.minQty), price: String(t.price) }))
      : [{ minQty: "", price: "" }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedTiers = priceTiers
      .filter((t) => t.minQty !== "" || t.price !== "")
      .map((t) => ({ minQty: Number(t.minQty), price: Number(t.price) }));

    if (parsedTiers.length === 0) {
      setError("Add at least one bulk price tier.");
      return;
    }
    if (parsedTiers.some((t) => !Number.isFinite(t.minQty) || t.minQty <= 0)) {
      setError("Each tier needs a valid minimum quantity greater than 0.");
      return;
    }
    if (parsedTiers.some((t) => !Number.isFinite(t.price) || t.price <= 0)) {
      setError("Each tier needs a valid price greater than 0.");
      return;
    }
    if (new Set(parsedTiers.map((t) => t.minQty)).size !== parsedTiers.length) {
      setError("Each tier needs a distinct minimum quantity.");
      return;
    }

    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      title,
      slug,
      description: String(form.get("description") ?? ""),
      priceTiers: parsedTiers,
      regularPrice: Number(form.get("regularPrice")),
      unit: String(form.get("unit") ?? "piece"),
      stock: Number(form.get("stock") ?? 0),
      images,
      isPublished: form.get("isPublished") === "on",
      isFeatured: form.get("isFeatured") === "on",
      seoTitle: String(form.get("seoTitle") ?? ""),
      seoDescription: String(form.get("seoDescription") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/products/${product!.id}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unable to save product");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Product Title">
          <input
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="input"
          />
        </Field>
        <Field label="Slug (URL)">
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className="input"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="input"
        />
      </Field>

      <div className="rounded-2xl border border-ink-100 bg-ink-50/40 p-4 sm:p-5">
        <PriceTiersEditor value={priceTiers} onChange={setPriceTiers} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label={`Regular Price (${CURRENCY_SYMBOL})`}>
          <input
            name="regularPrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.regularPrice}
            className="input"
          />
        </Field>
        <Field label="Unit">
          <input name="unit" defaultValue={product?.unit ?? "piece"} className="input" />
        </Field>
        <Field label="Stock Quantity">
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            className="input"
          />
        </Field>
        <Field label="Category">
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? ""}
            className="input"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <MultiImageDropzone value={images} onChange={setImages} folder="products" label="Product Images" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="SEO Title (optional)">
          <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className="input" />
        </Field>
        <Field label="SEO Description (optional)">
          <input
            name="seoDescription"
            defaultValue={product?.seoDescription ?? ""}
            className="input"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={product?.isPublished ?? true}
            className="h-4 w-4 rounded border-ink-300 text-brand-600"
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured ?? false}
            className="h-4 w-4 rounded border-ink-300 text-brand-600"
          />
          Featured on homepage
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
