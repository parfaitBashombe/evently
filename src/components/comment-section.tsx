"use client";

import { useEffect, useState } from "react";
import { FaSpinner, FaComment, FaPaperPlane } from "react-icons/fa6";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 focus-visible:border-[#004ac6]/60 transition-colors disabled:opacity-40";

export const CommentSection = ({
  token,
  initialCount,
}: {
  token: string;
  initialCount: number;
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/invite/${token}/comments`);
      if (res.ok) setComments(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/invite/${token}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to post comment");
      }
      const comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const count = comments.length || initialCount;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <FaComment className="h-4 w-4 text-[#60a5fa]" />
        <h2 className="font-bold text-white">
          Comments
          {count > 0 && (
            <span className="ml-2 rounded-full bg-[#004ac6]/15 px-2 py-0.5 text-xs font-semibold text-[#60a5fa]">
              {count}
            </span>
          )}
        </h2>
      </div>

      {/* Post form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0e1528] p-4"
      >
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          required
          className={inputClass}
        />
        <div className="flex gap-2">
          <input
            placeholder="Leave a comment…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            required
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004ac6] text-white transition-colors hover:bg-[#003da8] disabled:opacity-50"
          >
            {submitting ? (
              <FaSpinner className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FaPaperPlane className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}
      </form>

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <FaSpinner className="h-5 w-5 animate-spin text-white/35" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-white/35 py-8">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#0e1528] p-4 transition-colors hover:border-white/12"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004ac6]/15 text-xs font-bold text-[#60a5fa]">
                    {comment.name[0]?.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-white">{comment.name}</span>
                </div>
                <span className="text-xs text-white/35">
                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed pl-10">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
