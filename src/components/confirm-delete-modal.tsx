"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
}

export const ConfirmDeleteModal = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Event",
  description = "Are you sure you want to delete this event? This action cannot be undone.",
}: ConfirmDeleteModalProps) => {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete event", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          background: "linear-gradient(160deg, #1a0f2e 0%, #16161f 100%)",
          border: "1px solid rgba(149,95,255,0.2)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px rounded-t-lg"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #955fff 40%, #c084fc 60%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        <DialogHeader className="mb-2">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(248,113,113,0.15)" }}
            >
              <Trash2 className="h-5 w-5 text-red-400" />
            </span>
            <DialogTitle
              className="text-xl font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 30%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            className="border-white/10"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={pending}
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none",
            }}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
