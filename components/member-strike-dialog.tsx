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
import { MemberStrike } from "@/types/clash";
import { saveMemberStrike } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";

interface MemberStrikeDialogProps {
  memberId: string;
  memberName: string;
  existingStrike?: MemberStrike;
  onStrikeSaved: () => void;
}

export function MemberStrikeDialog({
  memberId,
  memberName,
  existingStrike,
  onStrikeSaved,
}: MemberStrikeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(existingStrike?.reason || "");

  const handleSaveStrike = () => {
    if (!reason.trim()) return;

    const strikeData: MemberStrike = {
      id: existingStrike?.id || uuidv4(),
      memberId,
      reason,
      date: new Date().toISOString(),
    };

    saveMemberStrike(strikeData);
    setOpen(false);
    onStrikeSaved();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          {existingStrike ? "Edit Strike" : "Add Strike"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingStrike ? "Edit strike" : "Add strike"} for {memberName}
          </DialogTitle>
          <DialogDescription>
            Record a strike against this clan member for rule violations.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="reason" className="text-right">
              Reason
            </label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder="Missed war attack, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleSaveStrike}>
            Save Strike
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
