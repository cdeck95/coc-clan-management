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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveMemberNote } from "@/lib/api";
import { FileEdit } from "lucide-react";

interface MemberNoteDialogProps {
  memberId: string;
  memberName: string;
  onNoteSaved: () => Promise<void>;
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

export function MemberNoteDialog({
  memberId,
  memberName,
  onNoteSaved,
  buttonVariant = "default",
  buttonSize = "default",
  buttonLabel,
}: MemberNoteDialogProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteId = `note_${Date.now()}`;
      const noteData = {
        id: noteId,
        memberId,
        note,
        date: new Date().toISOString(),
      };

      await saveMemberNote(noteData);
      console.log("Note saved successfully:", noteId);

      // Clear form and close dialog
      setNote("");
      setOpen(false);

      // Refresh the member data
      await onNoteSaved();
    } catch (error) {
      console.error("Error saving note:", error);

      // Even if there's an error with S3, the localStorage fallback should have worked
      // Let's refresh the member data anyway
      try {
        await onNoteSaved();
      } catch (refreshError) {
        console.error(
          "Error refreshing member data after note save:",
          refreshError
        );
      }

      // Optional: Show an error message to the user
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
              <FileEdit className="mr-2 h-4 w-4" /> Add Note
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Note for {memberName}</DialogTitle>
            <DialogDescription>
              Create a note that is visible to clan leadership.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your note here..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
