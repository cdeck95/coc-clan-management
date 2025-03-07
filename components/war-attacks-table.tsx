import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CurrentWar } from "@/types/clash";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface WarAttacksTableProps {
  warData: CurrentWar;
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
          {allMembers.map((member) => (
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
                  <span className="font-medium">{member.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {member.tag}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {member.townhallLevel}
              </TableCell>
              <TableCell>
                {member.attacks ? (
                  <div className="space-y-2">
                    {member.attacks.map((attack) => {
                      const defenderMapPos = attack.defenderTag
                        ? allMembers.find((m) => m.tag === attack.defenderTag)
                            ?.mapPosition || "?"
                        : "?";

                      return (
                        <div
                          key={attack.attackerTag + "-" + attack.defenderTag}
                          className="flex items-center gap-2 bg-muted/50 p-2 rounded-md"
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
                          <Badge variant="outline" className="text-xs">
                            {attack.destructionPercentage}%
                          </Badge>
                          <span className="text-sm">→ #{defenderMapPos}</span>
                        </div>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
