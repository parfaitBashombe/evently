"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle, Send } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

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
        <MessageCircle className="h-4 w-4 text-violet-400" />
        <h2 className="font-semibold">
          Comments{" "}
          {count > 0 && (
            <span className="ml-1 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-xs text-violet-300">
              {count}
            </span>
          )}
        </h2>
      </div>

      {/* Post form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          required
        />
        <div className="flex gap-2">
          <Input
            placeholder="Leave a comment…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={submitting || !name.trim() || !content.trim()}>
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{comment.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
