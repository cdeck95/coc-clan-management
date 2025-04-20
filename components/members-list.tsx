"use client";

import { useEffect, useState } from "react";
import {
  ClanMember,
  MemberNote,
  MemberStrike,
  BannedMember,
} from "@/types/clash";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import {
  Trophy,
  Medal,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FileText,
  Loader2,
  Ban,
  ClipboardCopy,
  Trash2,
} from "lucide-react";
import { cn, getDonationRatio, getRoleColor } from "@/lib/utils";
import { MemberNoteDialog } from "./member-note-dialog";
import { MemberStrikeDialog } from "./member-strike-dialog";
import { AddToBannedDialog } from "./add-to-banned-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  fetchMembersData,
  getMemberNotesByMemberId,
  getMemberStrikesByMemberId,
  deleteMemberNote,
  deleteMemberStrike,
  getBannedMembers,
} from "@/lib/api";
import { THLevelIcon } from "./th-level-icon";
import { toast } from "sonner";

interface MembersListProps {
  members: ClanMember[];
}

export function MembersList({ members }: MembersListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [memberNotes, setMemberNotes] = useState<Record<string, MemberNote[]>>(
    {}
  );
  const [memberStrikes, setMemberStrikes] = useState<
    Record<string, MemberStrike[]>
  >({});
  const [bannedStatus, setBannedStatus] = useState<
    Record<
      string,
      {
        isBanned: boolean;
        bannedMember: BannedMember | null;
      }
    >
  >({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allBannedMembers, setAllBannedMembers] = useState<BannedMember[]>([]);
  const [loadingData, setLoadingData] = useState<Record<string, boolean>>({});
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    // Load data for all members in a single batch request
    loadBatchMemberData();
  }, []);

  const handleToggleExpand = (member: ClanMember) => {
    const newExpanded = { ...expanded };
    newExpanded[member.tag] = !expanded[member.tag];
    setExpanded(newExpanded);
  };

  const loadBatchMemberData = async () => {
    setLoadingData((prev) => {
      const newState = { ...prev };
      members.forEach((member) => {
        newState[member.tag] = true;
      });
      return newState;
    });

    try {
      // Get all member IDs
      const memberIds = members.map((member) => member.tag);

      // Fetch data for all members in one request
      const batchData = await fetchMembersData(memberIds);

      // Update state with batch results
      setMemberNotes((prev) => {
        const newNotes = { ...prev };
        Object.keys(batchData).forEach((memberId) => {
          newNotes[memberId] = batchData[memberId].notes || [];
        });
        return newNotes;
      });

      setMemberStrikes((prev) => {
        const newStrikes = { ...prev };
        Object.keys(batchData).forEach((memberId) => {
          newStrikes[memberId] = batchData[memberId].strikes || [];
        });
        return newStrikes;
      });

      // Get all banned members at once
      const bannedMembers = await getBannedMembers();
      setAllBannedMembers(bannedMembers);

      // Create banned status map for all members
      const newBannedStatus: Record<
        string,
        {
          isBanned: boolean;
          bannedMember: BannedMember | null;
        }
      > = {};

      // Check each member against the banned list
      memberIds.forEach((memberId) => {
        const bannedMember = bannedMembers.find(
          (banned) => banned.tag === memberId
        );
        newBannedStatus[memberId] = {
          isBanned: !!bannedMember,
          bannedMember: bannedMember || null,
        };
      });

      console.log("Banned members:", bannedMembers);
      console.log("Banned status:", newBannedStatus);

      setBannedStatus(newBannedStatus);
      setInitialDataLoaded(true);
    } catch (error) {
      console.error(`Error loading batch data:`, error);
    } finally {
      setLoadingData((prev) => {
        const newState = { ...prev };
        members.forEach((member) => {
          newState[member.tag] = false;
        });
        return newState;
      });
    }
  };

  const handleDataRefresh = async (memberId: string) => {
    setLoadingData((prev) => ({ ...prev, [memberId]: true }));

    try {
      // For individual refreshes, fetch all necessary data
      const [notes, strikes] = await Promise.all([
        getMemberNotesByMemberId(memberId),
        getMemberStrikesByMemberId(memberId),
      ]);

      // Fetch all banned members if needed (could be optimized to only fetch if you've added/removed bans)
      const bannedMembers = await getBannedMembers();
      setAllBannedMembers(bannedMembers);

      // Check if this member is banned
      const bannedMember = bannedMembers.find(
        (banned) => banned.tag === memberId
      );

      setMemberNotes((prev) => ({ ...prev, [memberId]: notes }));
      setMemberStrikes((prev) => ({ ...prev, [memberId]: strikes }));
      setBannedStatus((prev) => ({
        ...prev,
        [memberId]: {
          isBanned: !!bannedMember,
          bannedMember: bannedMember || null,
        },
      }));
    } catch (error) {
      console.error(`Error refreshing data for ${memberId}:`, error);
    } finally {
      setLoadingData((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (noteId: string, memberId: string) => {
    try {
      await deleteMemberNote(noteId);
      toast.success("Note deleted successfully");
      await handleDataRefresh(memberId);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  // Handle deleting a strike
  const handleDeleteStrike = async (strikeId: string, memberId: string) => {
    try {
      await deleteMemberStrike(strikeId);
      toast.success("Strike deleted successfully");
      await handleDataRefresh(memberId);
    } catch (error) {
      console.error("Error deleting strike:", error);
      toast.error("Failed to delete strike");
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Determine badge colors based on donation ratio
  const getDonationBadgeColor = (ratio: number) => {
    if (ratio >= 2) return "bg-green-500 text-white";
    if (ratio >= 1) return "bg-blue-500 text-white";
    if (ratio >= 0.5) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getRoleName = (role: string) => {
    switch (role.toLowerCase()) {
      case "leader":
        return "Leader";
      case "coleader":
        return "Co-Leader";
      case "admin":
        return "Elder";
      default:
        return "Member";
    }
  };

  const [isMobile, setIsMobile] = useState(false);
  const handleResize = () => {
    setIsMobile(window.innerWidth < 1024);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // If initial data is still loading, display a loading state for the entire list
  if (!initialDataLoaded && members.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Loading member data...</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="container mx-auto px-2 py-4 space-y-2">
        {members.map((member, idx) => {
          const donationRatio = getDonationRatio(
            member.donations,
            member.donationsReceived
          );
          const formattedRatio =
            donationRatio === Infinity ? "∞" : donationRatio.toFixed(1);

          const hasNotes = memberNotes[member.tag]?.length > 0;
          const hasStrikes = memberStrikes[member.tag]?.length > 0;
          const isBanned = bannedStatus[member.tag]?.isBanned || false;
          const bannedInfo = bannedStatus[member.tag]?.bannedMember || null;

          const rankChange = member.previousClanRank - member.clanRank;

          return (
            <Collapsible
              key={member.tag}
              open={expanded[member.tag]}
              onOpenChange={() => handleToggleExpand(member)}
              className={cn(
                "border rounded-md overflow-hidden transition-all relative",
                isBanned
                  ? "border-red-500 bg-red-50/50 dark:bg-red-900/10"
                  : idx === 0
                  ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10"
                  : idx === 1
                  ? "border-zinc-400/50 bg-zinc-50/50 dark:bg-zinc-800/10"
                  : idx === 2
                  ? "border-amber-700/50 bg-amber-100/30 dark:bg-amber-800/10"
                  : "bg-white dark:bg-gray-800"
              )}
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    {expanded[member.tag] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                {/* Rank medal for top 3 */}
                <div className="absolute top-[7px] left-[7px] flex flex-row gap-2 justify-center items-center">
                  {idx === 0 && <Medal className="h-5 w-5 text-amber-500" />}
                  {idx === 1 && <Medal className="h-5 w-5 text-zinc-400" />}
                  {idx === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                  {idx > 2 && (
                    <span className="text-sm text-muted-foreground">
                      {member.clanRank}
                    </span>
                  )}
                  {/* Rank change */}
                  {rankChange != 0 && (
                    <div className="w-6 flex justify-center">
                      {rankChange > 0 && (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      )}
                      {rankChange < 0 && (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute top-[7px] right-[5px] flex flex-row gap-2 items-center">
                  {/* Trophies */}
                  <div className="flex items-center min-w-[60px] max-w-[60px]">
                    <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                    <span>{member.trophies}</span>
                  </div>
                </div>
                {/* Member name and role */}
                <div className="flex flex-col items-center justify-center gap-2">
                  {/* Townhall Level */}
                  <div className="flex flex-row gap-2 justify-center items-center min-w-[32px]">
                    <THLevelIcon level={member.townHallLevel || 1} size="sm" />
                    <div className="font-medium">{member.name}</div>
                    {/* Status indicators */}
                    {hasNotes && <FileText className="h-3 w-3 text-blue-500" />}
                    {hasStrikes && (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                    {isBanned && <Ban className="h-3 w-3 text-red-500" />}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`${getRoleColor(member.role)} text-xs`}>
                      {getRoleName(member.role)}
                    </Badge>
                  </div>

                  {/* Player tag with copy button */}
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-mono">
                    {member.tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(member.tag);
                      }}
                    >
                      <ClipboardCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Donation ratio */}
                <div className="flex items-center justify-end min-w-[160px] text-right text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Donated</span>
                      <span className="font-medium text-green-600">
                        {member.donations}
                      </span>
                      <span className="mx-1">/</span>
                      <span className="text-muted-foreground">Received</span>
                      <span className="font-medium text-blue-600">
                        {member.donationsReceived}
                      </span>
                    </div>
                    <Badge
                      className={cn(
                        "mt-1 flex flex-row justify-center items-center",
                        getDonationBadgeColor(donationRatio)
                      )}
                    >
                      Ratio: {formattedRatio}
                    </Badge>
                  </div>
                </div>
              </div>

              <CollapsibleContent>
                <div className="px-3 pb-3 pt-1 bg-muted/20">
                  {loadingData[member.tag] ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Loading member data...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Level:</div>
                          <div className="font-medium">{member.expLevel}</div>
                          <div>Townhall:</div>
                          <div className="font-medium flex items-center">
                            <THLevelIcon
                              level={member.townHallLevel || 1}
                              size="sm"
                              className="mr-2"
                            />
                            Level {member.townHallLevel || "?"}
                          </div>
                          <div>Trophies:</div>
                          <div className="font-medium">{member.trophies}</div>
                          <div>Versus Trophies:</div>
                          <div className="font-medium">
                            {member.versusTrophies}
                          </div>
                          <div>League:</div>
                          <div className="font-medium flex items-center gap-1">
                            {member.league?.name}
                            {member.league?.iconUrls?.small && (
                              <img
                                src={member.league.iconUrls.small}
                                alt={member.league.name}
                                className="h-4 w-4"
                              />
                            )}
                          </div>
                        </div>

                        {/* Ban status alert */}
                        {isBanned && bannedInfo && (
                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <div className="flex gap-2 items-start">
                              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                  This member is on the banned list
                                </p>
                                <p className="text-xs mt-1">
                                  Reason: {bannedInfo.reason}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Banned on:{" "}
                                  {new Date(
                                    bannedInfo.date
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes section */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Notes</h4>
                            <MemberNoteDialog
                              memberId={member.tag}
                              memberName={member.name}
                              onNoteSaved={() => handleDataRefresh(member.tag)}
                              buttonVariant="ghost"
                              buttonSize="sm"
                              buttonLabel="Add"
                            />
                          </div>
                          {memberNotes[member.tag]?.length ? (
                            <div className="space-y-2">
                              {memberNotes[member.tag].map((note) => (
                                <div
                                  key={note.id}
                                  className="text-xs p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                >
                                  <div className="flex justify-between items-start">
                                    <p>{note.note}</p>
                                    <div className="flex space-x-1 ml-2">
                                      <MemberNoteDialog
                                        memberId={member.tag}
                                        memberName={member.name}
                                        onNoteSaved={() =>
                                          handleDataRefresh(member.tag)
                                        }
                                        buttonVariant="ghost"
                                        buttonSize="icon"
                                        existingNote={note}
                                        isEditing={true}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteNote(note.id, member.tag);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-[10px] mt-1 text-muted-foreground">
                                    {new Date(note.date).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No notes recorded
                            </p>
                          )}
                        </div>
                        {/* Strikes section */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Strikes</h4>
                            <MemberStrikeDialog
                              memberId={member.tag}
                              memberName={member.name}
                              onStrikeSaved={() =>
                                handleDataRefresh(member.tag)
                              }
                              buttonVariant="ghost"
                              buttonSize="sm"
                              buttonLabel="Add"
                            />
                          </div>
                          {memberStrikes[member.tag]?.length ? (
                            <div className="space-y-2">
                              {memberStrikes[member.tag].map((strike) => (
                                <div
                                  key={strike.id}
                                  className="text-xs p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                >
                                  <div className="flex justify-between items-start">
                                    <p className="font-medium">
                                      {strike.reason}
                                    </p>
                                    <div className="flex space-x-1 ml-2">
                                      <MemberStrikeDialog
                                        memberId={member.tag}
                                        memberName={member.name}
                                        onStrikeSaved={() =>
                                          handleDataRefresh(member.tag)
                                        }
                                        buttonVariant="ghost"
                                        buttonSize="icon"
                                        existingStrike={strike}
                                        isEditing={true}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteStrike(
                                            strike.id,
                                            member.tag
                                          );
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-[10px] mt-1 text-muted-foreground">
                                    {new Date(strike.date).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No strikes recorded
                            </p>
                          )}
                          <div className="mt-4 pt-3 border-t">
                            <h4 className="text-sm font-medium mb-2">
                              Donations
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Donated:</div>
                              <div className="font-medium text-green-600">
                                {member.donations}
                              </div>
                              <div>Received:</div>
                              <div className="font-medium text-blue-600">
                                {member.donationsReceived}
                              </div>
                              <div>Ratio:</div>
                              <div className="font-medium">
                                {formattedRatio}
                              </div>
                            </div>
                          </div>

                          {/* Add to Banned List button */}
                          <div className="mt-4">
                            <AddToBannedDialog
                              memberId={member.tag}
                              memberName={member.name}
                              onMemberBanned={() =>
                                handleDataRefresh(member.tag)
                              }
                              buttonVariant="outline"
                              buttonSize="sm"
                              isBanned={
                                bannedStatus[member.tag]?.isBanned || false
                              }
                              bannedMember={
                                bannedStatus[member.tag]?.bannedMember || null
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member, idx) => {
        const donationRatio = getDonationRatio(
          member.donations,
          member.donationsReceived
        );
        const formattedRatio =
          donationRatio === Infinity ? "∞" : donationRatio.toFixed(1);

        const hasNotes = memberNotes[member.tag]?.length > 0;
        const hasStrikes = memberStrikes[member.tag]?.length > 0;
        const isBanned = bannedStatus[member.tag]?.isBanned || false;
        const bannedInfo = bannedStatus[member.tag]?.bannedMember || null;

        const rankChange = member.previousClanRank - member.clanRank;

        return (
          <Collapsible
            key={member.tag}
            open={expanded[member.tag]}
            onOpenChange={() => handleToggleExpand(member)}
            className={cn(
              "border rounded-md overflow-hidden transition-all",
              isBanned
                ? "border-red-500 bg-red-50/50 dark:bg-red-900/10"
                : idx === 0
                ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10"
                : idx === 1
                ? "border-zinc-400/50 bg-zinc-50/50 dark:bg-zinc-800/10"
                : idx === 2
                ? "border-amber-700/50 bg-amber-100/30 dark:bg-amber-800/10"
                : ""
            )}
          >
            <div className="flex items-center gap-3 p-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                  {expanded[member.tag] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              {/* Rank medal for top 3 */}
              <div className="w-8 flex justify-center">
                {idx === 0 && <Medal className="h-5 w-5 text-amber-500" />}
                {idx === 1 && <Medal className="h-5 w-5 text-zinc-400" />}
                {idx === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                {idx > 2 && (
                  <span className="text-sm text-muted-foreground">
                    {member.clanRank}
                  </span>
                )}
              </div>

              {/* Rank change */}
              <div className="w-6 flex justify-center">
                {rankChange > 0 && (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                )}
                {rankChange < 0 && (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Townhall Level */}
              <div className="flex items-center min-w-[32px]">
                <THLevelIcon level={member.townHallLevel || 1} size="sm" />
              </div>

              {/* Trophies */}
              <div className="flex items-center min-w-[60px] max-w-[60px]">
                <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                <span>{member.trophies}</span>
              </div>

              {/* Member name and role */}
              <div className="flex-1 ml-4">
                <div className="font-medium">{member.name}</div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getRoleColor(member.role)} text-xs`}>
                    {getRoleName(member.role)}
                  </Badge>

                  {/* Player tag with copy button */}
                  <span className="text-xs text-muted-foreground font-mono flex items-center">
                    {member.tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(member.tag);
                      }}
                    >
                      <ClipboardCopy className="h-3 w-3" />
                    </Button>
                  </span>

                  {/* Status indicators */}
                  {hasNotes && <FileText className="h-3 w-3 text-blue-500" />}
                  {hasStrikes && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  {isBanned && <Ban className="h-3 w-3 text-red-500" />}
                </div>
              </div>

              {/* Donation ratio */}
              <div className="flex items-center justify-end min-w-[160px]">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      Donated
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {member.donations}
                    </span>
                    <span className="text-xs mx-1">/</span>
                    <span className="text-xs text-muted-foreground">
                      Received
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {member.donationsReceived}
                    </span>
                  </div>

                  <Badge
                    className={cn("mt-1", getDonationBadgeColor(donationRatio))}
                  >
                    Ratio: {formattedRatio}
                  </Badge>
                </div>
              </div>
            </div>

            <CollapsibleContent>
              <div className="px-4 pb-3 pt-1 bg-muted/20">
                {loadingData[member.tag] ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Loading member data...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Level:</div>
                        <div className="font-medium">{member.expLevel}</div>
                        <div>Townhall:</div>
                        <div className="font-medium flex items-center">
                          <THLevelIcon
                            level={member.townHallLevel || 1}
                            size="sm"
                            className="mr-2"
                          />
                          Level {member.townHallLevel || "?"}
                        </div>
                        <div>Trophies:</div>
                        <div className="font-medium">{member.trophies}</div>
                        <div>Versus Trophies:</div>
                        <div className="font-medium">
                          {member.versusTrophies}
                        </div>
                        <div>League:</div>
                        <div className="font-medium flex items-center gap-1">
                          {member.league?.name}
                          {member.league?.iconUrls?.small && (
                            <img
                              src={member.league.iconUrls.small}
                              alt={member.league.name}
                              className="h-4 w-4"
                            />
                          )}
                        </div>
                      </div>

                      {/* Ban status alert */}
                      {isBanned && bannedInfo && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                          <div className="flex gap-2 items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                This member is on the banned list
                              </p>
                              <p className="text-xs mt-1">
                                Reason: {bannedInfo.reason}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Banned on:{" "}
                                {new Date(bannedInfo.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes section */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Notes</h4>
                          <MemberNoteDialog
                            memberId={member.tag}
                            memberName={member.name}
                            onNoteSaved={() => handleDataRefresh(member.tag)}
                            buttonVariant="ghost"
                            buttonSize="sm"
                            buttonLabel="Add"
                          />
                        </div>

                        {memberNotes[member.tag]?.length ? (
                          <div className="space-y-2">
                            {memberNotes[member.tag].map((note) => (
                              <div
                                key={note.id}
                                className="text-xs p-2 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                              >
                                <div className="flex justify-between items-start">
                                  <p>{note.note}</p>
                                  <div className="flex space-x-1 ml-2">
                                    <MemberNoteDialog
                                      memberId={member.tag}
                                      memberName={member.name}
                                      onNoteSaved={() =>
                                        handleDataRefresh(member.tag)
                                      }
                                      buttonVariant="ghost"
                                      buttonSize="icon"
                                      existingNote={note}
                                      isEditing={true}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(note.id, member.tag);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-[10px] mt-1 text-muted-foreground">
                                  {new Date(note.date).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No notes recorded
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Strikes section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Strikes</h4>
                        <MemberStrikeDialog
                          memberId={member.tag}
                          memberName={member.name}
                          onStrikeSaved={() => handleDataRefresh(member.tag)}
                          buttonVariant="ghost"
                          buttonSize="sm"
                          buttonLabel="Add"
                        />
                      </div>

                      {memberStrikes[member.tag]?.length ? (
                        <div className="space-y-2">
                          {memberStrikes[member.tag].map((strike) => (
                            <div
                              key={strike.id}
                              className="text-xs p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-medium">{strike.reason}</p>
                                <div className="flex space-x-1 ml-2">
                                  <MemberStrikeDialog
                                    memberId={member.tag}
                                    memberName={member.name}
                                    onStrikeSaved={() =>
                                      handleDataRefresh(member.tag)
                                    }
                                    buttonVariant="ghost"
                                    buttonSize="icon"
                                    existingStrike={strike}
                                    isEditing={true}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteStrike(strike.id, member.tag);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-[10px] mt-1 text-muted-foreground">
                                {new Date(strike.date).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No strikes recorded
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t">
                        <h4 className="text-sm font-medium mb-2">Donations</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Donated:</div>
                          <div className="font-medium text-green-600">
                            {member.donations}
                          </div>
                          <div>Received:</div>
                          <div className="font-medium text-blue-600">
                            {member.donationsReceived}
                          </div>
                          <div>Ratio:</div>
                          <div className="font-medium">{formattedRatio}</div>
                        </div>
                      </div>

                      {/* Add to Banned List button */}
                      <div className="mt-4">
                        <AddToBannedDialog
                          memberId={member.tag}
                          memberName={member.name}
                          onMemberBanned={() => handleDataRefresh(member.tag)}
                          buttonVariant="outline"
                          isBanned={bannedStatus[member.tag]?.isBanned || false}
                          bannedMember={
                            bannedStatus[member.tag]?.bannedMember || null
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
