"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { BannedMember } from "@/types/clash";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function AddBannedMemberPage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const { saveBannedMember } = await import("@/lib/api");
      await saveBannedMember(bannedMember);

      router.push("/banned");
      router.refresh();
    } catch (error) {
      console.error("Error saving banned member:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Link
          href="/banned"
          className="text-muted-foreground hover:text-foreground flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Banned Members
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Banned Player</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag">Player Tag</Label>
              <Input
                id="tag"
                name="tag"
                placeholder="#ABC123DEF"
                value={formData.tag}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Player Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Player name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Reason for banning the player"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Banned Player"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
