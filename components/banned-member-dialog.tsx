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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BannedMember } from "@/types/clash";
import { saveBannedMember } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";
import LoadingSpinner from "./ui/loading-spinner";

interface BannedMemberDialogProps {
  onMemberBanned: () => void;
}

export function BannedMemberDialog({
  onMemberBanned,
}: BannedMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tag: "",
    name: "",
    reason: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { tag, name, reason } = formData;
    if (!tag || !name || !reason) return;

    setSaving(true);

    try {
      const bannedMember: BannedMember = {
        id: uuidv4(),
        tag,
        name,
        reason,
        date: new Date().toISOString(),
      };

      await saveBannedMember(bannedMember);
      setOpen(false);
      setFormData({ tag: "", name: "", reason: "" });
      onMemberBanned();
    } catch (error) {
      console.error("Error saving banned member:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Banned Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Banned Player</DialogTitle>
          <DialogDescription>
            Add details about a player who has been banned or kicked from the
            clan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="tag" className="text-right">
              Player Tag
            </Label>
            <Input
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              placeholder="#ABC123DEF"
              className="col-span-3"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="name" className="text-right">
              Player Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Player name"
              className="col-span-3"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-2">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Reason for banning the player"
              className="col-span-3"
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Banned Player"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
