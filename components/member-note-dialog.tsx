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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveMemberNote, updateMemberNote } from "@/lib/api";
import { FileEdit, Plus } from "lucide-react";
import { toast } from "sonner";
import { MemberNote } from "@/types/clash";

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
  existingNote?: MemberNote;
  isEditing?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialNote?: string;
}

export function MemberNoteDialog({
  memberId,
  memberName,
  onNoteSaved,
  buttonVariant = "default",
  buttonSize = "default",
  buttonLabel,
  existingNote,
  isEditing = false,
  isOpen,
  onOpenChange,
  initialNote = "",
}: MemberNoteDialogProps) {
  const [note, setNote] = useState(initialNote || "");
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

  // Load existing note data if editing
  useEffect(() => {
    if (existingNote && isEditing) {
      setNote(existingNote.note);
    } else if (initialNote && !isEditing) {
      setNote(initialNote);
    }
  }, [existingNote, isEditing, initialNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && existingNote) {
        // Update existing note
        const updatedNote = {
          ...existingNote,
          note,
        };
        await updateMemberNote(updatedNote);
        toast.success(`Note for ${memberName} has been updated.`);
      } else {
        // Create new note
        const noteId = `note_${Date.now()}`;
        const noteData = {
          id: noteId,
          memberId,
          note,
          date: new Date().toISOString(),
        };

        await saveMemberNote(noteData);
        toast.success(`Note for ${memberName} has been saved.`);
      }

      // Clear form and close dialog
      setNote("");
      handleOpenChange(false);

      // Refresh the member data
      await onNoteSaved();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note. Please try again.");
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
                <Plus className="mr-2 h-4 w-4" /> Add Note
              </>
            )}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit" : "Add"} Note for {memberName}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update an existing note that is visible to clan leadership."
                : "Create a note that is visible to clan leadership."}
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
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Note"
                : "Save Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
