"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getWarLeagueWar } from "@/lib/api";
import { ClanWarLeagueWar } from "@/types/clash";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { WarAttacksTable } from "@/components/war-attacks-table";
import { AlertCircle, ArrowLeft, Star, Clock } from "lucide-react";
import {
  formatDate,
  calculateTimeRemaining,
  getWarAttacksPerMember,
} from "@/lib/utils";
import Image from "next/image";

export default function WarDetailsPage() {
  const [war, setWar] = useState<ClanWarLeagueWar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const warTag = searchParams.get("warTag");
  const clanTag = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

  // Update time remaining for active wars
  useEffect(() => {
    if (!war || war.state !== "inWar" || !war.endTime) {
      setTimeRemaining("");
      return;
    }

    const updateTimeRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(war.endTime));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [war]);

  // Fetch war data
  useEffect(() => {
    async function fetchData() {
      if (!warTag) {
        setError("No war tag provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const warData = await getWarLeagueWar(warTag);
        setWar(warData);
      } catch (err) {
        console.error("Error fetching war details:", err);
        setError("Failed to load war details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [warTag]);

  // Determine which clan is ours
  const isOurClanAttacking = war?.clan.tag === clanTag;
  const ourClan = isOurClanAttacking ? war?.clan : war?.opponent;
  const theirClan = isOurClanAttacking ? war?.opponent : war?.clan;

  // Handle going back
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">War Details</h1>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !war) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">War Details</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "War not found"}</AlertDescription>
        </Alert>
        <Button onClick={handleBack}>Return to War Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">War Details</h1>
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

      {/* War Overview */}
      <Card>
        <CardHeader>
          <CardTitle>War Status</CardTitle>
          <CardDescription>
            {formatDate(war.preparationStartTime)} -{" "}
            {war.state !== "warEnded" ? "Ongoing" : formatDate(war.endTime)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* War Status */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    war.state === "inWar"
                      ? "bg-green-600"
                      : war.state === "preparation"
                      ? "bg-amber-600"
                      : "bg-blue-600"
                  }
                >
                  {war.state === "inWar"
                    ? "Battle Day"
                    : war.state === "preparation"
                    ? "Preparation Day"
                    : "War Ended"}
                </Badge>
                <span className="text-sm text-muted-foreground">{warTag}</span>
              </div>

              <div>
                <p className="text-sm">
                  <span className="font-medium">Team Size:</span> {war.teamSize}{" "}
                  vs {war.teamSize}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Attacks Per Member:</span>{" "}
                  {getWarAttacksPerMember(war)}
                </p>
              </div>
            </div>

            {/* Score Card */}
            <div className="flex-1">
              <div className="flex justify-between items-center p-4 border rounded-md">
                {/* Our clan */}
                <div className="text-center">
                  <div className="mb-2">
                    <Image
                      src={ourClan?.badgeUrls.small || ""}
                      alt={ourClan?.name || ""}
                      className="inline-block h-10 w-10"
                    />
                  </div>
                  <div className="text-sm max-w-[120px] truncate font-bold">
                    {ourClan?.name}
                  </div>
                  <div className="text-xl font-bold flex items-center justify-center">
                    {ourClan?.stars}{" "}
                    <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                  </div>
                  <div className="text-sm">
                    {Math.round(ourClan?.destructionPercentage || 0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {ourClan?.attacks} /{" "}
                    {war.teamSize * getWarAttacksPerMember(war)} attacks
                  </div>
                </div>

                <div className="text-2xl font-bold mx-4">vs</div>

                {/* Their clan */}
                <div className="text-center">
                  <div className="mb-2">
                    <Image
                      src={theirClan?.badgeUrls.small || ""}
                      alt={theirClan?.name || ""}
                      className="inline-block h-10 w-10"
                    />
                  </div>
                  <div className="text-sm max-w-[120px] truncate">
                    {theirClan?.name}
                  </div>
                  <div className="text-xl font-bold flex items-center justify-center">
                    {theirClan?.stars}{" "}
                    <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                  </div>
                  <div className="text-sm">
                    {Math.round(theirClan?.destructionPercentage || 0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {theirClan?.attacks} /{" "}
                    {war.teamSize * getWarAttacksPerMember(war)} attacks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* War Attacks Table */}
      <Card>
        <CardHeader>
          <CardTitle>War Attacks</CardTitle>
        </CardHeader>
        <CardContent>
          <WarAttacksTable warData={war} />
        </CardContent>
      </Card>
    </div>
  );
}
