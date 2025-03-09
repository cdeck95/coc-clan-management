"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, Info } from "lucide-react";
import { getCurrentWar } from "@/lib/api";
import { ClanWar } from "@/types/clash";
import { calculateTimeRemaining } from "@/lib/utils";
import { WarAttacksTable } from "@/components/war-attacks-table";
import Image from "next/image";

export default function WarPage() {
  const [currentWar, setCurrentWar] = useState<ClanWar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const router = useRouter();
  const clanTag = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";
  const cleanClanTag = clanTag.replace("#", "");

  // Update time remaining for active war
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (currentWar && currentWar.state === "inWar" && currentWar.endTime) {
        setTimeRemaining(calculateTimeRemaining(currentWar.endTime));
      } else {
        setTimeRemaining("");
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [currentWar]);

  // Fetch current war data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch current regular war
        const warData = await getCurrentWar(cleanClanTag);
        // console.log("Current war data received:", warData);
        setCurrentWar(warData);
      } catch (err) {
        console.error("Error fetching war data:", err);
        setError("Failed to load war data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cleanClanTag]);

  // Navigation to Clan War League
  const navigateToCWL = () => {
    router.push("/warleague");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <h1 className="text-3xl font-bold">Current War</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <h1 className="text-3xl font-bold">Current War</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Current War</h1>
        <Button onClick={navigateToCWL}>View Clan War League</Button>
      </div>

      {/* Time Remaining Alert */}
      {timeRemaining && (
        <Alert className="bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800">
          <Clock className="h-4 w-4" />
          <AlertTitle>Time Remaining</AlertTitle>
          <AlertDescription className="font-mono text-lg">
            {timeRemaining}
          </AlertDescription>
        </Alert>
      )}

      {!currentWar || currentWar.state === "notInWar" ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Active War</AlertTitle>
          <AlertDescription>
            The clan is not currently participating in a regular war.
            <Button variant="link" onClick={navigateToCWL}>
              Check Clan War League
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* War Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>War Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge
                    className={
                      currentWar.state === "inWar"
                        ? "bg-green-600"
                        : currentWar.state === "preparation"
                        ? "bg-amber-600"
                        : "bg-blue-600"
                    }
                  >
                    {currentWar.state === "inWar"
                      ? "Battle Day"
                      : currentWar.state === "preparation"
                      ? "Preparation Day"
                      : "War Ended"}
                  </Badge>

                  {currentWar.state === "preparation" &&
                    currentWar.startTime && (
                      <div className="text-sm">
                        Starts:{" "}
                        {new Date(currentWar.startTime).toLocaleString()}
                      </div>
                    )}

                  {currentWar.state === "inWar" && timeRemaining && (
                    <div className="text-sm font-semibold">
                      {timeRemaining} remaining
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Size Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Team Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentWar.teamSize} vs {currentWar.teamSize}
                </div>
                <CardDescription>2 attacks per member</CardDescription>
              </CardContent>
            </Card>

            {/* Score Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  {/* Our clan */}
                  <div className="text-center">
                    <div className="mb-2">
                      <Image
                        src={currentWar.clan.badgeUrls.small}
                        alt={currentWar.clan.name}
                        width={32}
                        height={32}
                        className="inline-block h-8 w-8"
                      />
                    </div>
                    <div className="text-xl font-bold">
                      {currentWar.clan.stars}
                    </div>
                    <div className="text-sm">
                      {Math.round(currentWar.clan.destructionPercentage)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentWar.clan.attacks} / {currentWar.teamSize * 2}{" "}
                      attacks
                    </div>
                  </div>

                  <div className="text-2xl font-bold mx-4">vs</div>

                  {/* Opponent clan */}
                  <div className="text-center">
                    <div className="mb-2">
                      <Image
                        src={currentWar.opponent.badgeUrls.small}
                        alt={currentWar.opponent.name}
                        width={32}
                        height={32}
                        className="inline-block h-8 w-8"
                      />
                    </div>
                    <div className="text-xl font-bold">
                      {currentWar.opponent.stars}
                    </div>
                    <div className="text-sm">
                      {Math.round(currentWar.opponent.destructionPercentage)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentWar.opponent.attacks} / {currentWar.teamSize * 2}{" "}
                      attacks
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* War Attacks Table */}
          <Card>
            <CardHeader>
              <CardTitle>War Attacks</CardTitle>
            </CardHeader>
            <CardContent>
              <WarAttacksTable warData={currentWar} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
