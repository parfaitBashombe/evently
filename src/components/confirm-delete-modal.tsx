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
import { Loader2, Trash2, TriangleAlert } from "lucide-react";

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
  description = "This action cannot be undone. The event and all its RSVP data will be permanently deleted.",
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
      <DialogContent className="sm:max-w-sm">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px rounded-t-xl bg-red-500/50"
        />

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
              <TriangleAlert className="h-4 w-4 text-red-400" />
            </span>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
