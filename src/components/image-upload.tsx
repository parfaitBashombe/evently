"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 text-muted-foreground transition-colors hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-violet-400 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <ImageIcon className="h-6 w-6" />
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
        <Input
          placeholder="Or paste an image URL…"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="text-xs"
        />
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
