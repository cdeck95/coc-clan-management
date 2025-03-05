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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMemberStrike } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

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
}

export function MemberStrikeDialog({
  memberId,
  memberName,
  onStrikeSaved,
  buttonVariant = "destructive",
  buttonSize = "default",
  buttonLabel,
}: MemberStrikeDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const strikeId = `strike_${Date.now()}`;
      const strikeData = {
        id: strikeId,
        memberId,
        reason,
        date: new Date().toISOString(),
      };

      await saveMemberStrike(strikeData);
      console.log("Strike saved successfully:", strikeId);

      // Clear form and close dialog
      setReason("");
      setOpen(false);

      // Refresh the member data
      await onStrikeSaved();
    } catch (error) {
      console.error("Error saving strike:", error);

      // Even if there's an error with S3, the localStorage fallback should have worked
      // Let's refresh the member data anyway
      try {
        await onStrikeSaved();
      } catch (refreshError) {
        console.error(
          "Error refreshing member data after strike save:",
          refreshError
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonLabel ? (
            buttonLabel
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" /> Add Strike
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Strike for {memberName}</DialogTitle>
            <DialogDescription>
              Create a strike record for rule violations.
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
              {isSubmitting ? "Saving..." : "Add Strike"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
