"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveBannedMember } from "@/lib/api";
import { BanIcon } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { BannedMember } from "@/types/clash";
import { RemoveFromBannedDialog } from "./remove-from-banned-dialog";

interface AddToBannedDialogProps {
  memberId: string;
  memberName: string;
  onMemberBanned: () => Promise<void>;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonLabel?: string;
  isBanned?: boolean;
  bannedMember?: BannedMember | null;
}

export function AddToBannedDialog({
  memberId,
  memberName,
  onMemberBanned,
  buttonVariant = "outline",
  buttonSize = "default",
  buttonLabel,
  isBanned = false,
  bannedMember = null,
}: AddToBannedDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bannedMember: BannedMember = {
        id: uuidv4(),
        tag: memberId,
        name: memberName,
        reason,
        date: new Date().toISOString(),
      };

      await saveBannedMember(bannedMember);

      // Clear form and close dialog
      setReason("");
      setOpen(false);

      // Show success toast
      toast.success(`${memberName} has been added to banned list.`);

      // Refresh the member data
      await onMemberBanned();
    } catch (error) {
      console.error("Error adding to banned list:", error);

      // Show error toast
      toast.error("Failed to add to banned list. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBanned && bannedMember) {
    return (
      <RemoveFromBannedDialog
        bannedMember={bannedMember}
        onMemberUnbanned={onMemberBanned}
        buttonVariant={buttonVariant}
        buttonSize={buttonSize}
        buttonLabel={buttonLabel}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonLabel ? (
            buttonLabel
          ) : (
            <>
              <BanIcon className="mr-2 h-4 w-4" /> Add to Banned List
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add {memberName} to Banned List</DialogTitle>
            <DialogDescription>
              Add this player to the banned list with a reason for the ban.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for banning this player..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add to Banned List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
