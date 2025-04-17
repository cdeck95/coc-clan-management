"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getBannedMembers,
  saveBannedMember,
  removeBannedMember,
} from "@/lib/api";
import { BannedMember } from "@/types/clash";
import {
  UserPlus,
  Trash2,
  Search,
  ArrowUpDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export default function BannedClientPage() {
  const [bannedMembers, setBannedMembers] = useState<BannedMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<BannedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BannedMember;
    direction: "ascending" | "descending";
  }>({ key: "date", direction: "descending" });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newBannedMember, setNewBannedMember] = useState({
    name: "",
    tag: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [removeConfirmDialog, setRemoveConfirmDialog] = useState<{
    open: boolean;
    member: BannedMember | null;
  }>({ open: false, member: null });
  const [removing, setRemoving] = useState(false);

  // Fetch banned members on component mount
  useEffect(() => {
    fetchBannedMembers();
  }, []);

  // Apply search and sort when dependencies change
  useEffect(() => {
    let result = [...bannedMembers];

    // Apply search filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(lowercasedTerm) ||
          member.tag.toLowerCase().includes(lowercasedTerm) ||
          member.reason.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const key = sortConfig.key;

      if (key === "date") {
        const dateA = new Date(a[key]).getTime();
        const dateB = new Date(b[key]).getTime();

        return sortConfig.direction === "ascending"
          ? dateA - dateB
          : dateB - dateA;
      }

      if (a[key] < b[key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredMembers(result);
  }, [bannedMembers, searchTerm, sortConfig]);

  const fetchBannedMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      const members = await getBannedMembers();
      setBannedMembers(members);
    } catch (err) {
      console.error("Error loading banned members:", err);
      setError("Failed to load banned members list");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof BannedMember) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  const handleAddBannedMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean up the tag - ensure it starts with #
      let formattedTag = newBannedMember.tag.trim();
      if (!formattedTag.startsWith("#")) {
        formattedTag = "#" + formattedTag;
      }

      const bannedMember: BannedMember = {
        id: uuidv4(),
        name: newBannedMember.name.trim(),
        tag: formattedTag,
        reason: newBannedMember.reason.trim(),
        date: new Date().toISOString(),
      };

      await saveBannedMember(bannedMember);

      // Clear form and close dialog
      setNewBannedMember({ name: "", tag: "", reason: "" });
      setOpenAddDialog(false);

      // Show success toast
      toast.success(`${bannedMember.name} has been added to banned list`);

      // Refresh the list
      await fetchBannedMembers();
    } catch (err) {
      console.error("Error adding banned member:", err);
      toast.error("Failed to add banned member");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBannedMember = async () => {
    if (!removeConfirmDialog.member) return;

    setRemoving(true);

    try {
      await removeBannedMember(removeConfirmDialog.member.id);

      // Close dialog
      setRemoveConfirmDialog({ open: false, member: null });

      // Show success toast
      toast.success(
        `${removeConfirmDialog.member.name} has been removed from banned list`
      );

      // Refresh the list
      await fetchBannedMembers();
    } catch (err) {
      console.error("Error removing banned member:", err);
      toast.error("Failed to remove banned member");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card className="shadow-md grid grid-cols-1 m-2">
      <CardHeader className="bg-muted/40">
        <CardTitle className="text-2xl font-bold">
          Banned Members List
        </CardTitle>
        <CardDescription className="flex flex-row items-center justify-between py-2">
          <div>Members who are not allowed to rejoin the clan</div>
          <Button onClick={() => setOpenAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Banned Player
          </Button>
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, tag or reason..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-2 grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading banned members...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 p-6 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="overflow-x-auto grid grid-cols-1">
            <Table className="!max-w-[100%] table-auto">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[200px]">
                    <button
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <button
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort("tag")}
                    >
                      Tag <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[300px]">
                    <button
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort("reason")}
                    >
                      Reason <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <button
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      Date <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="font-mono">{member.tag}</TableCell>
                    <TableCell>{member.reason}</TableCell>
                    <TableCell>
                      {new Date(member.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setRemoveConfirmDialog({ open: true, member })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No banned members found. This list will show any players who have
              been banned from joining the clan.
            </p>
          </div>
        )}
      </CardContent>

      {/* Add Banned Member Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddBannedMember}>
            <DialogHeader>
              <DialogTitle>Add Banned Player</DialogTitle>
              <DialogDescription>
                Add a player to the banned list. They will be flagged if they
                try to rejoin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Player Name</Label>
                <Input
                  id="name"
                  placeholder="Enter player name"
                  value={newBannedMember.name}
                  onChange={(e) =>
                    setNewBannedMember((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">Player Tag</Label>
                <Input
                  id="tag"
                  placeholder="#ABC123"
                  value={newBannedMember.tag}
                  onChange={(e) =>
                    setNewBannedMember((prev) => ({
                      ...prev,
                      tag: e.target.value,
                    }))
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the player tag from Clash of Clans (e.g., #ABC123)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Ban</Label>
                <Textarea
                  id="reason"
                  placeholder="Why is this player banned?"
                  value={newBannedMember.reason}
                  onChange={(e) =>
                    setNewBannedMember((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add to Banned List"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <Dialog
        open={removeConfirmDialog.open}
        onOpenChange={(open) =>
          setRemoveConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove from Banned List</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this player from the banned list?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {removeConfirmDialog.member && (
              <div className="space-y-2">
                <div>
                  <Label className="font-semibold">Player:</Label>
                  <p className="text-sm">
                    {removeConfirmDialog.member.name} (
                    {removeConfirmDialog.member.tag})
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Reason for ban:</Label>
                  <p className="text-sm">{removeConfirmDialog.member.reason}</p>
                </div>
                <div>
                  <Label className="font-semibold">Banned on:</Label>
                  <p className="text-sm">
                    {new Date(
                      removeConfirmDialog.member.date
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setRemoveConfirmDialog({ open: false, member: null })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveBannedMember}
              disabled={removing}
            >
              {removing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove from Banned List"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
