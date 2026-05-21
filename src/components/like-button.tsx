"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";

const getOrCreateFingerprint = () => {
  if (typeof window === "undefined") return "";
  const key = "evently_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(key, fp);
  }
  return fp;
};

export const LikeButton = ({
  token,
  initialCount,
}: {
  token: string;
  initialCount: number;
}) => {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fp = getOrCreateFingerprint();
    fetch(`/api/invite/${token}/like?fp=${fp}`)
      .then((r) => r.json())
      .then((data) => {
        setCount(data.count ?? initialCount);
        setLiked(data.liked ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, initialCount]);

  const toggle = async () => {
    if (toggling) return;
    setToggling(true);
    const fp = getOrCreateFingerprint();
    try {
      const res = await fetch(`/api/invite/${token}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint: fp }),
      });
      const data = await res.json();
      setCount(data.count);
      setLiked(data.liked);
    } catch {
      // silent
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading || toggling}
      className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
        liked
          ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
          : "border-border bg-card text-muted-foreground hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-400"
      } disabled:opacity-60`}
      aria-label={liked ? "Unlike" : "Like"}
    >
      {toggling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-transform group-active:scale-90 ${liked ? "fill-rose-400" : ""}`}
        />
      )}
      <span className="tabular-nums">{count}</span>
    </button>
  );
};
