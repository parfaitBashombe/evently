"use client";

import { useRef, useState } from "react";
import { FaImage, FaSpinner, FaXmark } from "react-icons/fa6";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export const ImageUpload = ({ value, onChange, label = "Cover image" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "/evently/covers");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
    } catch (e) {
      setError("Upload failed. Try again or paste a URL below.");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Preview */}
      {value ? (
        <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <FaXmark className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/3 py-8 text-white/30 transition-colors hover:border-[#004ac6]/40 hover:bg-[#004ac6]/5 hover:text-[#60a5fa] disabled:opacity-50"
        >
          {uploading ? (
            <FaSpinner className="h-6 w-6 animate-spin" />
          ) : (
            <FaImage className="h-6 w-6" />
          )}
          <span className="text-sm">{uploading ? "Uploading…" : `Upload ${label}`}</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {/* URL fallback */}
      <div className="flex gap-2">
        <input
          placeholder="Or paste an image URL…"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-xs rounded-lg px-3 py-2 h-9 w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#004ac6]/40 focus-visible:border-[#004ac6]/60 transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <FaXmark className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
};
