"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClanWar } from "@/types/clash";
import { AlertTriangle, ArrowDown, ArrowUp, Award, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { MemberNoteDialog } from "./member-note-dialog";
import { toast } from "sonner";
import { MemberStrikeDialog } from "./member-strike-dialog";

interface WarAnalyticsProps {
  warData: ClanWar;
}

type AttackAnalysis = {
  attackerName: string;
  attackerTag: string;
  defenderName: string;
  defenderTag: string;
  attackerTH: number;
  defenderTH: number;
  attackerPosition: number;
  defenderPosition: number;
  stars: number;
  destructionPercentage: number;
  type: "great" | "blunder";
  reason: string;
};

export function WarAnalytics({ warData }: WarAnalyticsProps) {
  // Get our clan members
  const ourClanMembers = [...warData.clan.members];
  const opponentMembers = [...warData.opponent.members];

  // Sort members by map position
  const sortedOurMembers = [...ourClanMembers].sort(
    (a, b) => a.mapPosition - b.mapPosition
  );
  const sortedOpponentMembers = [...opponentMembers].sort(
    (a, b) => a.mapPosition - b.mapPosition
  );

  // Combined array of all members for easier lookup
  const allMembers = [...sortedOurMembers, ...sortedOpponentMembers];

  // Function to get member by tag
  const getMemberByTag = (tag: string) => {
    return allMembers.find((member) => member.tag === tag);
  };

  // Function to get opponent of a given map position
  const getMirrorOpponent = (position: number) => {
    return sortedOpponentMembers.find(
      (member) => member.mapPosition === position
    );
  };

  // Function to check if mirror was 3-starred before first attack
  const wasMirrorThreeStarred = (member: (typeof sortedOurMembers)[0]) => {
    if (!member.attacks || member.attacks.length === 0) return false;

    const mirror = getMirrorOpponent(member.mapPosition);
    if (!mirror) return false;

    // Get all attacks on this mirror opponent before this member's first attack
    const firstAttackTime = new Date(member.attacks[0].order).getTime();

    // Check if any attack on the mirror resulted in 3 stars before this attack
    const priorAttacksOnMirror = sortedOurMembers
      .flatMap((m) => m.attacks || [])
      .filter((attack) => {
        const attackTime = new Date(attack.order).getTime();
        return (
          attackTime < firstAttackTime &&
          attack.defenderTag === mirror.tag &&
          attack.stars === 3
        );
      });

    return priorAttacksOnMirror.length > 0;
  };

  // Analyze all attacks from our clan
  const analyzeAttacks = (): AttackAnalysis[] => {
    const analysisResults: AttackAnalysis[] = [];

    // Loop through our clan members
    ourClanMembers.forEach((member) => {
      if (!member.attacks) return;

      // Check each attack
      member.attacks.forEach((attack, attackIndex) => {
        const defenderMember = getMemberByTag(attack.defenderTag);
        if (!defenderMember) return;

        const isFirstAttack = attackIndex === 0;
        const mirrorThreeStarred = wasMirrorThreeStarred(member);

        // Find mirror opponent
        const mirror = getMirrorOpponent(member.mapPosition);

        // Create base analysis object
        const baseAnalysis = {
          attackerName: member.name,
          attackerTag: member.tag,
          defenderName: defenderMember.name,
          defenderTag: defenderMember.tag,
          attackerTH: member.townhallLevel,
          defenderTH: defenderMember.townhallLevel,
          attackerPosition: member.mapPosition,
          defenderPosition: defenderMember.mapPosition,
          stars: attack.stars,
          destructionPercentage: attack.destructionPercentage,
        };

        // Great attacks - 3 stars against same or higher TH
        if (
          attack.stars === 3 &&
          member.townhallLevel <= defenderMember.townhallLevel
        ) {
          analysisResults.push({
            ...baseAnalysis,
            type: "great",
            reason:
              member.townhallLevel < defenderMember.townhallLevel
                ? "Three starred a higher town hall!"
                : "Perfect three star attack!",
          });
        }

        // Blunder 1: Attacking down a TH level but not getting 3 stars
        if (
          member.townhallLevel > defenderMember.townhallLevel &&
          attack.stars < 3
        ) {
          analysisResults.push({
            ...baseAnalysis,
            type: "blunder",
            reason: `Failed to 3-star a lower TH${defenderMember.townhallLevel} (got ${attack.stars} stars)`,
          });
        }

        // Blunder 2: First attack not on mirror (unless mirror was already 3-starred)
        if (
          isFirstAttack &&
          mirror &&
          defenderMember.tag !== mirror.tag &&
          !mirrorThreeStarred
        ) {
          analysisResults.push({
            ...baseAnalysis,
            type: "blunder",
            reason: `Did not attack their mirror`,
          });
        }

        // Blunder 3: Attacking up but not getting 3 stars
        if (
          defenderMember.mapPosition < member.mapPosition &&
          attack.stars < 3
        ) {
          analysisResults.push({
            ...baseAnalysis,
            type: "blunder",
            reason: `Attacked up (#${defenderMember.mapPosition}) but only got ${attack.stars} stars`,
          });
        }

        // Blunder 4: Less than 2 stars & 80% against same TH level
        if (
          member.townhallLevel === defenderMember.townhallLevel &&
          (attack.stars < 2 ||
            (attack.stars === 2 && attack.destructionPercentage < 80))
        ) {
          analysisResults.push({
            ...baseAnalysis,
            type: "blunder",
            reason: `Low performance against same TH${defenderMember.townhallLevel} (${attack.stars}⭐ ${attack.destructionPercentage}%)`,
          });
        }
      });
    });

    return analysisResults;
  };

  const attackAnalysis = analyzeAttacks();

  // const demoGreatAttack = {
  //   attackerName: "Demo Attacker",
  //   attackerTag: "#P8RUY922G",
  //   defenderName: "Demo Defender",
  //   defenderTag: "#654321",
  //   attackerTH: 14,
  //   defenderTH: 13,
  //   attackerPosition: 1,
  //   defenderPosition: 2,
  //   stars: 3,
  //   destructionPercentage: 100,
  //   type: "great" as const,
  //   reason: "Perfect three star attack!",
  // };
  // // Add a demo great attack for testing
  // attackAnalysis.push(demoGreatAttack);

  // const demoBlunderAttack = {
  //   attackerName: "Demo Blunder",
  //   attackerTag: "#P8RUY922G",
  //   defenderName: "Demo Defender",
  //   defenderTag: "#210987",
  //   attackerTH: 12,
  //   defenderTH: 13,
  //   attackerPosition: 3,
  //   defenderPosition: 4,
  //   stars: 1,
  //   destructionPercentage: 50,
  //   type: "blunder" as const,
  //   reason: "Failed to 3-star a higher TH!",
  // }; // Add a demo blunder attack for testing
  // attackAnalysis.push(demoBlunderAttack);

  const greatAttacks = attackAnalysis.filter((a) => a.type === "great");
  const blunders = attackAnalysis.filter((a) => a.type === "blunder");

  // Handle data refresh after note or strike is saved
  const handleDataSaved = async () => {
    toast.success("Member data updated successfully");
  };

  if (attackAnalysis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War Analytics</CardTitle>
          <CardDescription>No attacks analyzed yet</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          No attack data available for analysis
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <CardHeader className="p-2">
        <CardTitle>War Analytics</CardTitle>
        <CardDescription>Notable attacks in this war</CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-6 p-0">
          {/* Great attacks section */}
          <div className="p-0">
            <h3 className="text-lg font-semibold flex items-center mb-2">
              <Award className="h-5 w-5 mr-2 text-green-500" />
              Great Attacks
            </h3>
            {greatAttacks.length > 0 ? (
              <div className="space-y-2 p-0">
                {greatAttacks.map((attack, idx) => (
                  <Popover key={idx}>
                    <PopoverTrigger asChild>
                      <div className="flex justify-between w-full items-center gap-2 p-2 border rounded-md bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors">
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex flex0-row gap-2 items-center font-medium truncate min-w-fit">
                            {attack.attackerName}{" "}
                            {attack.attackerTH > attack.defenderTH && (
                              <ArrowDown className="h-4 w-4 text-green-500" />
                            )}
                            {attack.defenderPosition <
                              attack.attackerPosition && (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>

                          <Label className="text-xs">{attack.reason}</Label>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-1 ml-auto">
                            {Array(attack.stars)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-yellow-500 text-yellow-500"
                                />
                              ))}
                          </div>
                          <Badge className="ml-1 bg-green-500">
                            {attack.destructionPercentage}%
                          </Badge>
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-80 p-0">
                      <div className="p-4 border-b">
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">
                          {attack.reason}
                        </h4>
                        <p className="text-sm">
                          #{attack.attackerPosition} attacked #
                          {attack.defenderPosition}
                        </p>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Attacker
                          </p>
                          <p className="font-medium">{attack.attackerName}</p>
                          <p className="text-xs text-muted-foreground">
                            TH{attack.attackerTH}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Defender
                          </p>
                          <p className="font-medium">{attack.defenderName}</p>
                          <p className="text-xs text-muted-foreground">
                            TH{attack.defenderTH}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/30 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {Array(attack.stars)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 fill-yellow-500 text-yellow-500"
                              />
                            ))}
                        </div>
                        <Badge variant="secondary">
                          {attack.destructionPercentage}% destruction
                        </Badge>
                      </div>

                      {/* Add Quick Actions */}
                      <div className="p-4 border-t">
                        <p className="text-sm font-medium mb-2">
                          Quick Actions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {/* Add Note Button with Dialog directly in popover */}
                          <MemberNoteDialog
                            memberId={attack.attackerTag}
                            memberName={attack.attackerName}
                            onNoteSaved={handleDataSaved}
                            buttonVariant="outline"
                            buttonSize="sm"
                            initialNote={`Great attack in war! ${attack.reason} [${attack.stars}⭐, ${attack.destructionPercentage}%]`}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic p-4 border rounded-md">
                No standout attacks yet
              </div>
            )}
          </div>

          {/* Blunders section */}
          <div className="p-0">
            <h3 className="text-lg font-semibold flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Attack Opportunities
            </h3>
            {blunders.length > 0 ? (
              <div className="space-y-2 p-0">
                {blunders.map((attack, idx) => (
                  <Popover key={idx}>
                    <PopoverTrigger asChild>
                      <div className="flex justify-between w-full items-center gap-2 p-2 border rounded-md bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex flex0-row gap-2 items-center font-medium truncate max-w-[80%]">
                            {attack.attackerName}{" "}
                            {attack.attackerTH > attack.defenderTH && (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                            {attack.defenderPosition <
                              attack.attackerPosition && (
                              <ArrowUp className="h-4 w-4 text-red-500" />
                            )}
                          </div>

                          <Label className="text-xs">{attack.reason}</Label>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-1 ml-auto">
                            {Array(attack.stars)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-yellow-500 text-yellow-500"
                                />
                              ))}
                            {Array(3 - attack.stars)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 text-muted-foreground/30"
                                />
                              ))}
                          </div>
                          <Badge className="ml-1 bg-amber-500">
                            {attack.destructionPercentage}%
                          </Badge>
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-80 p-0">
                      <div className="p-4 border-b">
                        <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                          {attack.reason}
                        </h4>
                        <p className="text-sm">
                          #{attack.attackerPosition} attacked #
                          {attack.defenderPosition}
                        </p>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Attacker
                          </p>
                          <p className="font-medium">{attack.attackerName}</p>
                          <p className="text-xs text-muted-foreground">
                            TH{attack.attackerTH}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Defender
                          </p>
                          <p className="font-medium">{attack.defenderName}</p>
                          <p className="text-xs text-muted-foreground">
                            TH{attack.defenderTH}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/30 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {Array(attack.stars)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 fill-yellow-500 text-yellow-500"
                              />
                            ))}
                          {Array(3 - attack.stars)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 text-muted-foreground/30"
                              />
                            ))}
                        </div>
                        <Badge variant="secondary">
                          {attack.destructionPercentage}% destruction
                        </Badge>
                      </div>

                      {/* Add Quick Actions */}
                      <div className="p-4 border-t">
                        <p className="text-sm font-medium mb-2">
                          Quick Actions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {/* Add Note Button */}
                          <MemberNoteDialog
                            memberId={attack.attackerTag}
                            memberName={attack.attackerName}
                            onNoteSaved={handleDataSaved}
                            buttonVariant="outline"
                            buttonSize="sm"
                            initialNote={`Blunder attack in war! ${attack.reason} [${attack.stars}⭐, ${attack.destructionPercentage}%]`}
                          />

                          {/* Add Strike Button */}
                          <MemberStrikeDialog
                            memberId={attack.attackerTag}
                            memberName={attack.attackerName}
                            onStrikeSaved={handleDataSaved}
                            buttonVariant="destructive"
                            buttonSize="sm"
                            initialReason={`Blunder attack in war! ${attack.reason} [${attack.stars}⭐, ${attack.destructionPercentage}%]`}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic p-4 border rounded-md">
                No opportunities for improvement identified
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
