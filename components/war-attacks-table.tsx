import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClanWar } from "@/types/clash";
import { Star, Info } from "lucide-react";

interface WarAttacksTableProps {
  warData: ClanWar;
}

export function WarAttacksTable({ warData }: WarAttacksTableProps) {
  const { clan, opponent } = warData;

  // Combine both clan's members
  const allMembers = [
    ...clan.members.map((member) => ({ ...member, isOurClan: true })),
    ...opponent.members.map((member) => ({ ...member, isOurClan: false })),
  ];

  // Sort by position in the war map
  allMembers.sort((a, b) => a.mapPosition - b.mapPosition);

  // Function to find defender by tag
  const findDefenderByTag = (tag: string) => {
    return allMembers.find((m) => m.tag === tag);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">TH</TableHead>
            <TableHead>Attacks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allMembers.map((member) => {
            const hasAttacks = member.attacks && member.attacks.length > 0;

            return (
              <TableRow
                key={member.tag}
                className={
                  member.isOurClan ? "bg-primary-50 dark:bg-primary-950/10" : ""
                }
              >
                <TableCell className="text-center font-medium">
                  {member.mapPosition}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium truncate max-w-[120px] sm:max-w-[180px] md:max-w-full">
                      {member.name}
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px] md:max-w-full">
                      {member.tag}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {member.townhallLevel}
                </TableCell>
                <TableCell>
                  {hasAttacks ? (
                    <div className="space-y-2 flex flex-col">
                      {member.attacks?.map((attack) => {
                        const defender = findDefenderByTag(attack.defenderTag);

                        return (
                          <Popover
                            key={attack.attackerTag + "-" + attack.defenderTag}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between h-auto py-2 px-3"
                              >
                                <div className="flex items-center gap-1">
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
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {attack.destructionPercentage}%
                                  </Badge>
                                  <span className="text-sm hidden sm:inline">
                                    → #{defender?.mapPosition || "?"}
                                  </span>
                                  <Info className="h-4 w-4 sm:hidden" />
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Attack Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="space-y-1">
                                    <p className="text-muted-foreground">
                                      Attacker
                                    </p>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      #{member.mapPosition} • TH
                                      {member.townhallLevel}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-muted-foreground">
                                      Defender
                                    </p>
                                    <p className="font-medium">
                                      {defender?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      #{defender?.mapPosition || "?"} • TH
                                      {defender?.townhallLevel || "?"}
                                    </p>
                                  </div>
                                </div>
                                <div className="pt-2 border-t">
                                  <div className="flex items-center justify-between">
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
                                    <Badge className="text-sm">
                                      {attack.destructionPercentage}%
                                      destruction
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No attacks yet
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
