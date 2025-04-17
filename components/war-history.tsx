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
} from "lucide-react";
import Image from "next/image";

interface WarHistoryProps {
  clanTag: string;
}

export function WarHistory({ clanTag }: WarHistoryProps) {
  const [warLog, setWarLog] = useState<WarLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchWarLog() {
      try {
        setLoading(true);
        const cleanTag = clanTag.startsWith("#")
          ? clanTag.substring(1)
          : clanTag;
        const warLogData = await getWarLog(cleanTag);

        if (warLogData && warLogData.items) {
          setWarLog(warLogData.items);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-amber-500" />
          War History
        </CardTitle>
        <CardDescription>Recent war results for the clan</CardDescription>
      </CardHeader>
      <CardContent className="md:px-6">
        <div className="overflow-x-auto">
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
                const warDate = new Date(war.endTime);
                const isWin = war.result === "win";
                const isLoss = war.result === "lose";
                const isDraw = war.result === "tie";

                return (
                  <TableRow key={index} className="hover:bg-muted/40">
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
                        {war.result.toUpperCase()}
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
        </div>
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
  );
}
