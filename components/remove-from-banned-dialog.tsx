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
import { Label } from "@/components/ui/label";
import { removeBannedMember } from "@/lib/api";
import { toast } from "sonner";
import { BannedMember } from "@/types/clash";
import { BadgeMinus } from "lucide-react";

interface RemoveFromBannedDialogProps {
  bannedMember: BannedMember;
  onMemberUnbanned: () => Promise<void>;
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

export function RemoveFromBannedDialog({
  bannedMember,
  onMemberUnbanned,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buttonVariant = "destructive",
  buttonSize = "default",
  buttonLabel,
}: RemoveFromBannedDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRemove = async () => {
    setIsSubmitting(true);

    try {
      await removeBannedMember(bannedMember.id);

      // Close dialog
      setOpen(false);

      // Show success toast
      toast.success(`${bannedMember.name} has been removed from banned list.`);

      // Refresh the member data
      await onMemberUnbanned();
    } catch (error) {
      console.error("Error removing from banned list:", error);

      // Show error toast
      toast.error("Failed to remove from banned list. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size={buttonSize}>
          {buttonLabel ? (
            buttonLabel
          ) : (
            <>
              <BadgeMinus className="mr-2 h-4 w-4" /> Remove from Banned List
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove {bannedMember.name} from Banned List</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this player from the banned list?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-900/20">
            <Label className="text-sm font-medium">Ban Reason:</Label>
            <p className="mt-1 text-sm">{bannedMember.reason}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Banned on: {new Date(bannedMember.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Removing..." : "Remove from Banned List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
