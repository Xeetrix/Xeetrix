"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImageToSupabase, ImageUploadError } from "@/lib/upload-image";

export function ImageDropzone({
  value,
  onChange,
  folder,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  folder: "categories" | "products";
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const url = await uploadImageToSupabase(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof ImageUploadError ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (uploading) return;
    void handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {value && !uploading ? (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-xl border border-ink-200">
          <Image src={value} alt="Uploaded preview" fill sizes="320px" className="object-cover" />
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-700 hover:bg-white"
              aria-label="Replace image"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-40 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors",
            uploading
              ? "cursor-wait border-ink-200 bg-ink-50"
              : dragActive
                ? "border-brand-500 bg-brand-50"
                : "border-ink-200 bg-ink-50/60 hover:border-brand-400 hover:bg-brand-50/40"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              <span className="text-sm font-medium text-ink-600">Uploading...</span>
            </>
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-400 shadow-card">
                {value ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              </span>
              <span className="px-4 text-sm font-medium text-ink-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-ink-400">JPG, PNG, WEBP up to 5MB</span>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
