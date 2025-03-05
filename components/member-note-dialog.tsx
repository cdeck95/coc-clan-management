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
import { MemberNote } from "@/types/clash";
import { saveMemberNote } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";

interface MemberNoteDialogProps {
  memberId: string;
  memberName: string;
  existingNote?: MemberNote;
  onNoteSaved: () => void;
}

export function MemberNoteDialog({
  memberId,
  memberName,
  existingNote,
  onNoteSaved,
}: MemberNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(existingNote?.note || "");

  const handleSaveNote = () => {
    if (!note.trim()) return;

    const noteData: MemberNote = {
      id: existingNote?.id || uuidv4(),
      memberId,
      note,
      date: new Date().toISOString(),
    };

    saveMemberNote(noteData);
    setOpen(false);
    onNoteSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingNote ? "outline" : "default"} size="sm">
          {existingNote ? "Edit Note" : "Add Note"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingNote ? "Edit note" : "Add note"} for {memberName}
          </DialogTitle>
          <DialogDescription>
            Enter your notes about this clan member. This is visible only to
            you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter notes about this clan member..."
            className="h-32"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSaveNote}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
