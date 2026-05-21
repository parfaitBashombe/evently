"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FaSpinner, FaTrashCan, FaTriangleExclamation } from "react-icons/fa6";

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
      <DialogContent className="sm:max-w-sm bg-[#0e1528] border border-white/10 shadow-2xl shadow-black/40">
        {/* Red top accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-red-400 to-transparent" />

        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
              <FaTriangleExclamation className="h-5 w-5 text-red-400" />
            </span>
            <DialogTitle className="text-base font-bold text-white">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-sm text-white/45 leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/55 transition-colors hover:text-white hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50 shadow-sm"
          >
            {pending ? (
              <>
                <FaSpinner className="h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <FaTrashCan className="h-3.5 w-3.5" />
                Delete
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
