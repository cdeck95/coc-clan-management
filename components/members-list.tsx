"use client";

import { useState } from "react";
import { ClanMember, MemberNote, MemberStrike } from "@/types/clash";
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
} from "lucide-react";
import { cn, getDonationRatio, getRoleColor } from "@/lib/utils";
import { MemberNoteDialog } from "./member-note-dialog";
import { MemberStrikeDialog } from "./member-strike-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  getMemberNotesByMemberId,
  getMemberStrikesByMemberId,
} from "@/lib/api";
import { THLevelIcon } from "./th-level-icon";

interface MembersListProps {
  members: ClanMember[];
}

export function MembersList({ members }: MembersListProps) {
  console.log("MembersList", members);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [memberNotes, setMemberNotes] = useState<Record<string, MemberNote[]>>(
    {}
  );
  const [memberStrikes, setMemberStrikes] = useState<
    Record<string, MemberStrike[]>
  >({});
  const [loadingData, setLoadingData] = useState<Record<string, boolean>>({});

  const handleToggleExpand = async (member: ClanMember) => {
    const newExpanded = { ...expanded };
    newExpanded[member.tag] = !expanded[member.tag];
    setExpanded(newExpanded);

    // Load member notes and strikes when expanding
    if (
      newExpanded[member.tag] &&
      !memberNotes[member.tag] &&
      !loadingData[member.tag]
    ) {
      await loadMemberData(member.tag);
    }
  };

  const loadMemberData = async (memberId: string) => {
    setLoadingData((prev) => ({ ...prev, [memberId]: true }));
    try {
      const notes = await getMemberNotesByMemberId(memberId);
      const strikes = await getMemberStrikesByMemberId(memberId);

      setMemberNotes((prev) => ({ ...prev, [memberId]: notes }));
      setMemberStrikes((prev) => ({ ...prev, [memberId]: strikes }));
    } catch (error) {
      console.error(`Error loading data for ${memberId}:`, error);
    } finally {
      setLoadingData((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const handleDataRefresh = async (memberId: string) => {
    await loadMemberData(memberId);
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

        const rankChange = member.previousClanRank - member.clanRank;

        return (
          <Collapsible
            key={member.tag}
            open={expanded[member.tag]}
            onOpenChange={() => handleToggleExpand(member)}
            className={cn(
              "border rounded-md overflow-hidden transition-all",
              idx === 0
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

                  {/* Status indicators */}
                  {hasNotes && <FileText className="h-3 w-3 text-blue-500" />}
                  {hasStrikes && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
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
                                <p>{note.note}</p>
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
                              <p className="font-medium">{strike.reason}</p>
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
