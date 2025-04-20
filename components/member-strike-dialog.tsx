"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMemberStrike, updateMemberStrike } from "@/lib/api";
import { AlertTriangle, FileEdit } from "lucide-react";
import { toast } from "sonner";
import { MemberStrike } from "@/types/clash";

interface MemberStrikeDialogProps {
  memberId: string;
  memberName: string;
  onStrikeSaved: () => Promise<void>;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonLabel?: string;
  existingStrike?: MemberStrike;
  isEditing?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialReason?: string;
}

export function MemberStrikeDialog({
  memberId,
  memberName,
  onStrikeSaved,
  buttonVariant = "destructive",
  buttonSize = "default",
  buttonLabel,
  existingStrike,
  isEditing = false,
  isOpen,
  onOpenChange,
  initialReason = "",
}: MemberStrikeDialogProps) {
  const [reason, setReason] = useState(initialReason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(isOpen || false);

  // Handle controlled dialog state from parent
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Load existing strike data if editing
  useEffect(() => {
    if (existingStrike && isEditing) {
      setReason(existingStrike.reason);
    } else if (initialReason && !isEditing) {
      setReason(initialReason);
    }
  }, [existingStrike, isEditing, initialReason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && existingStrike) {
        // Update existing strike
        const updatedStrike = {
          ...existingStrike,
          reason,
        };
        await updateMemberStrike(updatedStrike);
        toast.success(`Strike for ${memberName} has been updated.`);
      } else {
        // Create new strike
        const strikeId = `strike_${Date.now()}`;
        const strikeData = {
          id: strikeId,
          memberId,
          reason,
          date: new Date().toISOString(),
        };

        await saveMemberStrike(strikeData);
        toast.success(`Strike for ${memberName} has been recorded.`);
      }

      // Clear form and close dialog
      setReason("");
      handleOpenChange(false);

      // Refresh the member data
      await onStrikeSaved();
    } catch (error) {
      console.error("Error saving strike:", error);
      toast.error("Failed to save strike. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isOpen && (
        <DialogTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize}>
            {buttonLabel ? (
              buttonLabel
            ) : isEditing ? (
              <FileEdit className="h-4 w-4" />
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" /> Add Strike
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} Strike for {memberName}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update an existing strike record for rule violations."
                : "Create a strike record for rule violations."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for the strike"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Strike"
                : "Add Strike"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
