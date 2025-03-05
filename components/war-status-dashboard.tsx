"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClanWar, WarLeagueGroup } from "@/types/clash";
import { getCurrentWar, getWarLeagueGroup } from "@/lib/api";
import { Swords, Trophy, Clock } from "lucide-react";
import LoadingSpinner from "./ui/loading-spinner";

// Use a clan tag without the hash or properly encode it when calling the API
const CLAN_TAG = "#GCVL29VJ"; // Your clan tag

export default function WarStatusDashboard() {
  const [currentWar, setCurrentWar] = useState<ClanWar | null>(null);
  const [leagueGroup, setLeagueGroup] = useState<WarLeagueGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWarData() {
      try {
        setLoading(true);
        setError(null);

        // Try to load current war first
        const war = await getCurrentWar(CLAN_TAG);
        setCurrentWar(war);

        // Try to load league group data if available
        try {
          const league = await getWarLeagueGroup(CLAN_TAG);
          setLeagueGroup(league);
        } catch (leagueError) {
          console.log("No league data available or error:", leagueError);
          // Not setting error here as this is an expected scenario
        }
      } catch (err) {
        console.error("Error loading war data:", err);
        setError("Failed to load war data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadWarData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War Status</CardTitle>
          <CardDescription>Loading current war information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War Status</CardTitle>
          <CardDescription>Error</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // No war active - simplified response for now
  if (!currentWar || currentWar?.state === "notInWar") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>War Status</CardTitle>
          <CardDescription>No active war</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Swords className="h-12 w-12 mb-4 opacity-50" />
            <p>Your clan is not currently participating in any wars.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {leagueGroup ? (
            <>
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Clan War League
            </>
          ) : (
            <>
              <Swords className="h-5 w-5 mr-2 text-primary" />
              Current War
            </>
          )}
        </CardTitle>
        <CardDescription>
          {currentWar && currentWar.state} - {currentWar.clan.name} vs{" "}
          {currentWar.opponent.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="font-semibold text-lg">{currentWar.clan.name}</p>
              <Badge>{currentWar.clan.stars} ⭐</Badge>
            </div>

            <div className="text-center">
              <Badge variant="outline" className="px-3 py-1 font-mono">
                {currentWar.teamSize} vs {currentWar.teamSize}
              </Badge>
            </div>

            <div className="text-center">
              <p className="font-semibold text-lg">
                {currentWar.opponent.name}
              </p>
              <Badge variant="secondary">{currentWar.opponent.stars} ⭐</Badge>
            </div>
          </div>

          <div className="border rounded-md p-3 mt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              War{" "}
              {currentWar.state === "inWar" ? "in progress" : currentWar.state}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
