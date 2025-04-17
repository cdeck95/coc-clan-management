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
import { Star, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WarMember {
  tag: string;
  name: string;
  mapPosition: number;
  townhallLevel: number;
  attacks?: {
    attackerTag: string;
    defenderTag: string;
    stars: number;
    destructionPercentage: number;
    order: string; // Ensuring this is typed as string to match the ClanWar type
  }[];
  isOurClan: boolean;
}

interface WarAttacksTableContentProps {
  members: WarMember[];
  allMembers: WarMember[];
  warEndTime?: string;
  warStatus?: string;
  attacksPerMember?: number;
}

// Helper function to parse different date formats, including Clash of Clans API format
const parseCoCAVIDate = (dateString?: string): Date | null => {
  if (!dateString) return null;

  try {
    // Try standard ISO format first
    let parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    // Regular expressions for different formats
    const isoWithoutHyphens =
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d{3}))?Z?$/;
    const match = dateString.match(isoWithoutHyphens);

    if (match) {
      // Extract components
      const [, year, month, day, hour, minute, second] = match;
      // Create standard ISO string with hyphens and colons
      const isoFormat = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
      parsedDate = new Date(isoFormat);

      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // If we got here, try to be even more flexible
    // This handles formats like "20220130T120000.000Z" (no hyphens/colons, with milliseconds)
    if (dateString.length >= 15) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);

      // Look for the T separator
      const tIndex = dateString.indexOf("T");
      if (tIndex > 0 && tIndex + 6 <= dateString.length) {
        const hour = dateString.substring(tIndex + 1, tIndex + 3);
        const minute = dateString.substring(tIndex + 3, tIndex + 5);
        const second = dateString.substring(tIndex + 5, tIndex + 7);

        // Create standard ISO string
        const isoFormat = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
        parsedDate = new Date(isoFormat);

        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }

    // Log the failed parsing
    console.error("Could not parse date format:", dateString);
    return null;
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return null;
  }
};

// Utility function to check if war is ending soon (less than 12 hours)
const isWarEndingSoon = (endTime?: string): boolean => {
  if (!endTime) return false;

  const endTimeDate = parseCoCAVIDate(endTime);
  if (!endTimeDate) return false;

  const now = new Date();

  // Calculate the difference in hours
  const hoursRemaining =
    (endTimeDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // For debugging
  if (process.env.NODE_ENV === 'development') {
    console.debug("War end time:", endTime);
    console.debug("Parsed end time:", endTimeDate.toISOString());
    console.debug("Current time:", now.toISOString());
    console.debug("Hours remaining:", hoursRemaining);
  }

  return hoursRemaining < 12 && hoursRemaining > 0;
};

// Utility function to check if war is over
const isWarOver = (endTime?: string): boolean => {
  if (!endTime) return false;

  const endTimeDate = parseCoCAVIDate(endTime);
  if (!endTimeDate) return false;

  const now = new Date();

  // Check if the war has ended
  return now > endTimeDate;
};

export function WarAttacksTableContent({
  members,
  allMembers,
  warEndTime,
  warStatus,
  attacksPerMember = 2,
}: WarAttacksTableContentProps) {
  // Function to find defender by tag
  const findDefenderByTag = (tag: string) => {
    return allMembers.find((m) => m.tag === tag);
  };

  // Check if war is ending soon or already over
  const warEnding = isWarEndingSoon(warEndTime);
  const warOver = warStatus === "warEnded" || isWarOver(warEndTime);

  return (
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
        {members.map((member) => {
          const hasAttacks = member.attacks && member.attacks.length > 0;
          const attacksMissing =
            attacksPerMember - (member.attacks?.length || 0);
          const isMissingAttacks = attacksMissing > 0;

          // Highlight if member is missing attacks and war is ending soon or already over
          const highlightMissing =
            (warEnding || warOver) && isMissingAttacks && member.isOurClan;

          return (
            <TableRow
              key={member.tag}
              className={cn(
                member.isOurClan ? "bg-primary-50 dark:bg-primary-950/10" : "",
                highlightMissing &&
                  "border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
              )}
            >
              <TableCell className="text-center font-medium">
                {member.mapPosition}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="font-medium truncate max-w-[120px] sm:max-w-[180px] md:max-w-full flex items-center">
                    {member.name}
                    {highlightMissing && (
                      <AlertTriangle className="ml-1 h-4 w-4 text-yellow-500" />
                    )}
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
                                    {attack.destructionPercentage}% destruction
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                    {isMissingAttacks && (
                      <div
                        className={cn(
                          "text-sm text-muted-foreground p-2 rounded-md border",
                          highlightMissing
                            ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                            : "border-muted"
                        )}
                      >
                        {attacksMissing === 1
                          ? "1 attack"
                          : `${attacksMissing} attacks`}{" "}
                        remaining
                        {highlightMissing &&
                          (warOver ? " - War ended!" : " - War ending soon!")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <span
                      className={cn(
                        "text-sm text-muted-foreground",
                        highlightMissing
                          ? "text-yellow-700 dark:text-yellow-400 font-medium"
                          : ""
                      )}
                    >
                      No attacks yet
                    </span>
                    {highlightMissing && (
                      <div className="mt-1 text-xs p-1.5 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                        {warOver ? "War ended!" : "War ending soon!"}{" "}
                        {attacksPerMember} attacks remaining
                      </div>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
