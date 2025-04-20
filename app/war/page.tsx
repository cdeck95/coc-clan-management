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
import { WarAnalytics } from "@/components/war-analytics";
import { WarHistory } from "@/components/war-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Clock, Info, Swords, Trophy, Users } from "lucide-react";
import { getCurrentWar } from "@/lib/api";
import { ClanWar } from "@/types/clash";
import { calculateTimeRemaining, formatDate } from "@/lib/utils";
import { WarAttacksTable } from "@/components/war-attacks-table";
import Image from "next/image";

export default function WarPage() {
  const [currentWar, setCurrentWar] = useState<ClanWar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");

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
      <div className="container mx-auto py-6 px-4 space-y-4">
        <h1 className="text-3xl font-bold">Current War</h1>
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-4">
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
    <div className="grid grid-cols-1 gap-4 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Clan War Dashboard</h1>
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
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Active War</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span>
                The clan is not currently participating in a regular war.
              </span>
              <Button
                variant="link"
                onClick={navigateToCWL}
                className="p-0 h-auto"
              >
                Check Clan War League
              </Button>
            </AlertDescription>
          </Alert>

          {/* Show war history even if there's no active war */}
          <WarHistory clanTag={clanTag} />
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span className="sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="attacks" className="flex items-center gap-1">
                <Swords className="h-4 w-4" />
                <span className="sm:inline">Attacks</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" />
                <span className="sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
                            Starts: {formatDate(currentWar.startTime)}
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
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {currentWar.teamSize} vs {currentWar.teamSize}
                      </div>
                      <Users className="h-5 w-5 text-muted-foreground" />
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
                        <div className="flex items-center justify-center">
                          <div className="text-xl font-bold mr-1">
                            {currentWar.clan.stars}
                          </div>
                          <Trophy className="h-4 w-4 fill-yellow-500 text-yellow-500" />
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
                        <div className="flex items-center justify-center">
                          <div className="text-xl font-bold mr-1">
                            {currentWar.opponent.stars}
                          </div>
                          <Trophy className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        </div>
                        <div className="text-sm">
                          {Math.round(
                            currentWar.opponent.destructionPercentage
                          )}
                          %
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentWar.opponent.attacks} /{" "}
                          {currentWar.teamSize * 2} attacks
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clan Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Our Clan</CardTitle>
                    <CardDescription>{currentWar.clan.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Image
                        src={currentWar.clan.badgeUrls.small}
                        alt={currentWar.clan.name}
                        width={64}
                        height={64}
                        className="h-16 w-16"
                      />
                      <div className="grid grid-cols-2 gap-x-12 gap-y-2 flex-1">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Total Attacks
                          </span>
                          <span className="font-medium">
                            {currentWar.clan.attacks} /{" "}
                            {currentWar.teamSize * 2}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Stars Earned
                          </span>
                          <span className="font-medium flex items-center">
                            {currentWar.clan.stars}
                            <Trophy className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Destruction
                          </span>
                          <span className="font-medium">
                            {Math.round(currentWar.clan.destructionPercentage)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Team Size
                          </span>
                          <span className="font-medium">
                            {currentWar.teamSize} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Opponent Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Opponent</CardTitle>
                    <CardDescription>
                      {currentWar.opponent.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Image
                        src={currentWar.opponent.badgeUrls.small}
                        alt={currentWar.opponent.name}
                        width={64}
                        height={64}
                        className="h-16 w-16"
                      />
                      <div className="grid grid-cols-2 gap-x-12 gap-y-2 flex-1">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Total Attacks
                          </span>
                          <span className="font-medium">
                            {currentWar.opponent.attacks} /{" "}
                            {currentWar.teamSize * 2}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Stars Earned
                          </span>
                          <span className="font-medium flex items-center">
                            {currentWar.opponent.stars}
                            <Trophy className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Destruction
                          </span>
                          <span className="font-medium">
                            {Math.round(
                              currentWar.opponent.destructionPercentage
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Team Size
                          </span>
                          <span className="font-medium">
                            {currentWar.teamSize} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attacks">
              {/* War Attacks Table */}
              <Card>
                <CardHeader>
                  <CardTitle>War Attacks</CardTitle>
                  <CardDescription>
                    All attacks from both clans in this war
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WarAttacksTable warData={currentWar} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              {/* War Analytics */}
              <WarAnalytics warData={currentWar} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
