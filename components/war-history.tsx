"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWarLog } from "@/lib/api";
import { WarLogEntry } from "@/types/clash";
import {
  Calendar,
  Trophy,
  Star,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
  Swords,
  Percent,
} from "lucide-react";
import Image from "next/image";

interface WarHistoryProps {
  clanTag: string;
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

    console.error("Could not parse date format:", dateString);
    return null;
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return null;
  }
};

export function WarHistory({ clanTag }: WarHistoryProps) {
  const [warLog, setWarLog] = useState<WarLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedWar, setSelectedWar] = useState<WarLogEntry | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchWarLog() {
      try {
        setLoading(true);
        const cleanTag = clanTag.startsWith("#")
          ? clanTag.substring(1)
          : clanTag;
        const warLogData = await getWarLog(cleanTag);

        if (warLogData) {
          setWarLog(warLogData);
        } else {
          setWarLog([]);
        }
      } catch (err) {
        console.error("Error fetching war log:", err);
        setError("Failed to load war history");
      } finally {
        setLoading(false);
      }
    }

    fetchWarLog();
  }, [clanTag]);

  const totalPages = Math.ceil(warLog.length / itemsPerPage);
  const paginatedWarLog = warLog.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleWarClick = (war: WarLogEntry) => {
    setSelectedWar(war);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War History</CardTitle>
          <CardDescription>Loading past wars...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War History</CardTitle>
          <CardDescription>Error loading war history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (warLog.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War History</CardTitle>
          <CardDescription>Past war results</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            No war history available. The API only provides the most recent
            wars.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="grid grid-cols-1 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-amber-500" />
            War History
          </CardTitle>
          <CardDescription>Recent war results for the clan</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Result</TableHead>
                <TableHead className="w-2/5">Opponent</TableHead>
                <TableHead className="w-1/5 text-center">Score</TableHead>
                <TableHead className="w-1/5 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWarLog.map((war, index) => {
                const warDate = parseCoCAVIDate(war.endTime) || new Date();
                const isWin = war.result === "win";
                const isLoss = war.result === "lose";
                const isDraw = war.result === "tie";

                return (
                  <TableRow
                    key={index}
                    className="hover:bg-muted/40 cursor-pointer"
                    onClick={() => handleWarClick(war)}
                  >
                    <TableCell>
                      <Badge
                        className={`${
                          isWin
                            ? "bg-green-500"
                            : isLoss
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      >
                        {isWin && <Check className="mr-1 h-3 w-3" />}
                        {isLoss && <X className="mr-1 h-3 w-3" />}
                        {isDraw && <Clock className="mr-1 h-3 w-3" />}
                        {war.result && war.result.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {war.opponent.badgeUrls?.small && (
                          <Image
                            src={war.opponent.badgeUrls.small}
                            alt={war.opponent.name}
                            width={24}
                            height={24}
                            className="h-6 w-6"
                          />
                        )}
                        <div className="font-medium">{war.opponent.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ({war.teamSize} vs {war.teamSize})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-base font-medium">
                          {war.clan.stars}
                        </span>
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="mx-1">-</span>
                        <span className="text-base font-medium">
                          {war.opponent.stars}
                        </span>
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(war.clan.destructionPercentage)}% vs{" "}
                        {Math.floor(war.opponent.destructionPercentage)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono text-sm">
                        {warDate.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {warDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog
        open={!!selectedWar}
        onOpenChange={(open) => !open && setSelectedWar(null)}
      >
        <DialogContent className="max-w-[90dvw] max-h-[90vh] overflow-y-auto">
          {selectedWar && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-orange-500" />
                  War Details
                </DialogTitle>
                <DialogDescription>
                  {parseCoCAVIDate(selectedWar.endTime)?.toLocaleDateString()} -{" "}
                  {selectedWar.teamSize} vs {selectedWar.teamSize}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Our Clan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      {selectedWar.clan.badgeUrls?.small && (
                        <Image
                          src={selectedWar.clan.badgeUrls.small}
                          alt={selectedWar.clan.name}
                          width={36}
                          height={36}
                          className="h-9 w-9"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {selectedWar.clan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Level {selectedWar.clan.clanLevel}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Stars
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-semibold">
                            {selectedWar.clan.stars}
                          </span>
                          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Destruction
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-semibold">
                            {Math.floor(selectedWar.clan.destructionPercentage)}
                            %
                          </span>
                          <Percent className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-destructive/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Swords className="h-4 w-4" />
                      Opponent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      {selectedWar.opponent.badgeUrls?.small && (
                        <Image
                          src={selectedWar.opponent.badgeUrls.small}
                          alt={selectedWar.opponent.name}
                          width={36}
                          height={36}
                          className="h-9 w-9"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {selectedWar.opponent.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Level {selectedWar.opponent.clanLevel}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Stars
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-semibold">
                            {selectedWar.opponent.stars}
                          </span>
                          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          Destruction
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-semibold">
                            {Math.floor(
                              selectedWar.opponent.destructionPercentage
                            )}
                            %
                          </span>
                          <Percent className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center items-center gap-4 py-2 my-2">
                <div
                  className={`text-center px-6 py-3 rounded-lg ${
                    selectedWar.result === "win"
                      ? "bg-green-500/10 text-green-600"
                      : selectedWar.result === "lose"
                      ? "bg-red-500/10 text-red-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                    {selectedWar.result === "win" && (
                      <Check className="h-5 w-5" />
                    )}
                    {selectedWar.result === "lose" && <X className="h-5 w-5" />}
                    {selectedWar.result === "tie" && (
                      <Clock className="h-5 w-5" />
                    )}
                    {selectedWar.result?.toUpperCase()}
                  </h3>
                  <p className="text-sm opacity-80">War Result</p>
                </div>
              </div>

              <div className="mt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Note: Detailed attack information is not available in the war
                  log. Only current wars provide detailed attack data.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
