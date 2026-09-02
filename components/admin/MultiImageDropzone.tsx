"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImageToSupabase, ImageUploadError } from "@/lib/upload-image";

const MAX_FILES = 8;

export function MultiImageDropzone({
  value,
  onChange,
  folder,
  label = "Images",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: "categories" | "products";
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const uploading = uploadingCount > 0;
  const remaining = MAX_FILES - value.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");

    const incoming = Array.from(files).slice(0, Math.max(remaining, 0));
    if (incoming.length === 0) {
      setError(`You can upload up to ${MAX_FILES} images.`);
      return;
    }
    if (files.length > incoming.length) {
      setError(`Only the first ${incoming.length} file(s) were queued — ${MAX_FILES} image limit.`);
    }

    setUploadingCount(incoming.length);
    const results = await Promise.allSettled(
      incoming.map((file) => uploadImageToSupabase(file, folder))
    );
    setUploadingCount(0);

    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);
    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );

    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    if (failures.length > 0) {
      const first = failures[0].reason;
      setError(
        first instanceof ImageUploadError
          ? first.message
          : `${failures.length} image(s) failed to upload. Try again.`
      );
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (uploading) return;
    void handleFiles(event.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">
        {label} <span className="font-normal text-ink-400">({value.length}/{MAX_FILES})</span>
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, index) => (
          <div
            key={url + index}
            className="group relative aspect-square overflow-hidden rounded-xl border border-ink-200"
          >
            <Image
              src={url}
              alt={`Image ${index + 1}`}
              fill
              sizes="160px"
              className="object-cover"
            />
            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-ink-950/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
              aria-label={`Remove image ${index + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`uploading-${i}`}
            className="flex aspect-square items-center justify-center rounded-xl border border-ink-200 bg-ink-50"
          >
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          </div>
        ))}

        {value.length + uploadingCount < MAX_FILES && (
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
              "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-center transition-colors",
              uploading
                ? "cursor-wait border-ink-200 bg-ink-50"
                : dragActive
                  ? "border-brand-500 bg-brand-50"
                  : "border-ink-200 bg-ink-50/60 hover:border-brand-400 hover:bg-brand-50/40"
            )}
          >
            <Plus className="h-5 w-5 text-ink-400" />
            <span className="px-2 text-[11px] font-medium leading-tight text-ink-500">
              Add images
            </span>
          </div>
        )}
      </div>

      <span className="text-xs text-ink-400">
        Drag and drop or click to upload. JPG, PNG, WEBP up to 5MB each. First image is the cover.
      </span>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
