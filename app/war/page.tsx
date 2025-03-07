"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertCircle,
  Trophy,
  Clock,
  Star,
  Info,
  BarChart3,
  Calendar,
} from "lucide-react";
import { getCurrentWar, getWarLeagueGroup, getWarLeagueWar } from "@/lib/api";
import {
  ClanWarLeagueGroup,
  ClanWarLeagueWar,
  CurrentWar,
} from "@/types/clash";
import { calculateTimeRemaining, getWarAttacksPerMember } from "@/lib/utils";
import { WarAttacksTable } from "@/components/war-attacks-table";
import Image from "next/image";

export default function WarPage() {
  const [currentWar, setCurrentWar] = useState<CurrentWar | null>(null);
  const [leagueGroup, setLeagueGroup] = useState<ClanWarLeagueGroup | null>(
    null
  );
  const [leagueWars, setLeagueWars] = useState<{
    [key: string]: ClanWarLeagueWar;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [activeTab, setActiveTab] = useState("current");

  const router = useRouter();
  const searchParams = useSearchParams();
  const clanTag = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";
  const cleanClanTag = clanTag.replace("#", "");

  // Helper to determine if we're in a CWL period
  const isInCWL =
    leagueGroup && leagueGroup.rounds && leagueGroup.rounds.length > 0;

  // Helper to get our clan's wars for a round
  const getClanWarsForRound = (roundIndex: number) => {
    if (!leagueGroup || !leagueGroup.rounds || !leagueGroup.rounds[roundIndex])
      return [];

    const roundWarTags = leagueGroup.rounds[roundIndex].warTags || [];
    console.log(roundWarTags);

    // Ensure roundWarTags is treated as an array of strings
    return roundWarTags
      .map((warTag) => {
        if (!warTag) return null;

        const war = leagueWars[warTag];
        // Skip if war data is not available
        if (!war || !war.clan || !war.opponent) return null;

        // Check if our clan is in this war
        const isClanInWar =
          war.clan.tag === clanTag || war.opponent.tag === clanTag;
        const isOurClanAttacking = war.clan.tag === clanTag;

        return {
          warTag,
          war,
          isClanInWar,
          isOurClanAttacking,
        };
      })
      .filter((item) => item !== null);
  };

  // Calculate current round index based on war status
  const getCurrentRoundIndex = () => {
    if (!leagueGroup || !leagueGroup.rounds) return 0;

    for (let i = 0; i < leagueGroup.rounds.length; i++) {
      const roundWars = getClanWarsForRound(i);
      // If any war in this round is in preparation or in war, this is the current round
      const hasActiveWar = roundWars.some(
        (item) =>
          item?.war.state === "preparation" || item?.war.state === "inWar"
      );

      if (hasActiveWar) return i;
    }

    // If no active wars found, check if any wars are not ended
    for (let i = 0; i < leagueGroup.rounds.length; i++) {
      const roundWars = getClanWarsForRound(i);
      const hasUnendedWar = roundWars.some(
        (item) => item?.war.state !== "warEnded"
      );
      if (hasUnendedWar) return i;
    }

    // Default to the last round if all are ended
    return leagueGroup.rounds.length - 1;
  };

  // Calculate group standings with correct star calculation
  const calculateGroupStandings = () => {
    if (!leagueGroup || !leagueWars) return [];

    const clanStats: {
      [key: string]: {
        tag: string;
        name: string;
        badgeUrl: string;
        wins: number;
        losses: number;
        ties: number;
        stars: number;
        destruction: number;
        attacksUsed: number;
        totalAttacks: number;
      };
    } = {};

    // Initialize all clans
    leagueGroup.clans.forEach((clan) => {
      clanStats[clan.tag] = {
        tag: clan.tag,
        name: clan.name,
        badgeUrl: clan.badgeUrls.medium,
        wins: 0,
        losses: 0,
        ties: 0,
        stars: 0,
        destruction: 0,
        attacksUsed: 0,
        totalAttacks: 0,
      };
    });

    // Process all wars
    Object.values(leagueWars).forEach((war) => {
      if (war.state !== "warEnded") return; // Only count completed wars

      const clan1 = war.clan;
      const clan2 = war.opponent;

      // Add war results
      if (clan1.stars > clan2.stars) {
        clanStats[clan1.tag].wins++;
        clanStats[clan2.tag].losses++;
        clanStats[clan1.tag].stars += 10; // Winner gets +10 stars
      } else if (clan2.stars > clan1.stars) {
        clanStats[clan2.tag].wins++;
        clanStats[clan1.tag].losses++;
        clanStats[clan2.tag].stars += 10; // Winner gets +10 stars
      } else {
        clanStats[clan1.tag].ties++;
        clanStats[clan2.tag].ties++;
      }

      // Add attack statistics
      clanStats[clan1.tag].stars += clan1.stars;
      clanStats[clan2.tag].stars += clan2.stars;
      clanStats[clan1.tag].destruction += clan1.destructionPercentage;
      clanStats[clan2.tag].destruction += clan2.destructionPercentage;

      // Track attacks used
      const clan1Attacks = clan1.members.reduce(
        (sum, member) => sum + (member.attacks?.length || 0),
        0
      );
      const clan2Attacks = clan2.members.reduce(
        (sum, member) => sum + (member.attacks?.length || 0),
        0
      );

      clanStats[clan1.tag].attacksUsed += clan1Attacks;
      clanStats[clan2.tag].attacksUsed += clan2Attacks;
      clanStats[clan1.tag].totalAttacks += clan1.members.length;
      clanStats[clan2.tag].totalAttacks += clan2.members.length;
    });

    // Convert to array and sort
    return Object.values(clanStats).sort((a, b) => {
      // Sort by wins first
      if (a.wins !== b.wins) return b.wins - a.wins;
      // Then by stars
      if (a.stars !== b.stars) return b.stars - a.stars;
      // Then by destruction percentage
      return b.destruction - a.destruction;
    });
  };

  // Update time remaining for active wars
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (
        activeTab === "current" &&
        currentWar &&
        currentWar.state === "inWar" &&
        currentWar.endTime
      ) {
        setTimeRemaining(calculateTimeRemaining(currentWar.endTime));
      } else if (
        activeTab === "cwl" &&
        selectedRound >= 0 &&
        leagueGroup?.rounds
      ) {
        const clanWars = getClanWarsForRound(selectedRound);
        const ourWar = clanWars.find((item) => item?.isClanInWar);

        if (ourWar?.war && ourWar.war.state === "inWar" && ourWar.war.endTime) {
          setTimeRemaining(calculateTimeRemaining(ourWar.war.endTime));
        } else {
          setTimeRemaining("");
        }
      } else {
        setTimeRemaining("");
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [currentWar, leagueWars, selectedRound, activeTab, leagueGroup]);

  // Fetch current war data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch current regular war
        const warData = await getCurrentWar(cleanClanTag);
        setCurrentWar(warData);

        // Fetch CWL group if available
        try {
          const leagueGroupData = await getWarLeagueGroup(cleanClanTag);
          setLeagueGroup(leagueGroupData);

          // If CWL group found, fetch all war data
          if (
            leagueGroupData &&
            leagueGroupData.rounds &&
            leagueGroupData.rounds.length > 0
          ) {
            // Collect all war tags
            const allWarTags: string[] = [];
            leagueGroupData.rounds.forEach((round) => {
              if (round && round.warTags) {
                allWarTags.push(...round.warTags);
              }
            });

            if (allWarTags.length > 0) {
              console.log("allWarTags", allWarTags);
              const warPromises = allWarTags.map((tag) => getWarLeagueWar(tag));
              const wars = await Promise.all(warPromises);

              // Create a map of war tag to war data
              const warMap: { [key: string]: ClanWarLeagueWar } = {};
              allWarTags.forEach((tag, index) => {
                if (tag && wars[index]) {
                  warMap[tag] = wars[index];
                }
              });

              setLeagueWars(warMap);

              // Auto-select current round
              const currentRound = getCurrentRoundIndex();
              setSelectedRound(currentRound);

              // If we're in CWL, default to the CWL tab
              if (leagueGroupData.state !== "notInWar") {
                setActiveTab("cwl");
              }
            }
          }
        } catch (err) {
          console.error("Error fetching CWL data:", err);
          // Don't set error state here, just continue with regular war if available
        }
      } catch (err) {
        console.error("Error fetching war data:", err);
        setError("Failed to load war data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cleanClanTag]);

  // Determine which tab to show based on params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "cwl" || tab === "current") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/war?tab=${tab}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <h1 className="text-3xl font-bold">War Dashboard</h1>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <h1 className="text-3xl font-bold">War Dashboard</h1>
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
      <h1 className="text-3xl font-bold">War Dashboard</h1>

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

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="current">Current War</TabsTrigger>
          <TabsTrigger value="cwl" disabled={!isInCWL}>
            Clan War League
          </TabsTrigger>
        </TabsList>

        {/* Current War Tab */}
        <TabsContent value="current">
          {!currentWar || currentWar.state === "notInWar" ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Active War</AlertTitle>
              <AlertDescription>
                The clan is not currently participating in a regular war.
                {isInCWL && (
                  <Button variant="link" onClick={() => handleTabChange("cwl")}>
                    View CWL Wars
                  </Button>
                )}
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
                    <CardDescription>
                      {getWarAttacksPerMember(currentWar)} attacks per member
                    </CardDescription>
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
                          {currentWar.clan.attacks} /{" "}
                          {currentWar.teamSize *
                            getWarAttacksPerMember(currentWar)}{" "}
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
                            className="inline-block h-8 w-8"
                          />
                        </div>
                        <div className="text-xl font-bold">
                          {currentWar.opponent.stars}
                        </div>
                        <div className="text-sm">
                          {Math.round(
                            currentWar.opponent.destructionPercentage
                          )}
                          %
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentWar.opponent.attacks} /{" "}
                          {currentWar.teamSize *
                            getWarAttacksPerMember(currentWar)}{" "}
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
        </TabsContent>

        {/* CWL Tab */}
        <TabsContent value="cwl">
          {!isInCWL ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No CWL Data</AlertTitle>
              <AlertDescription>
                The clan is not currently participating in Clan War League.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* CWL Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Clan War League - {leagueGroup?.season}</CardTitle>
                  <CardDescription>
                    {leagueGroup?.clans.length} clans competing in{" "}
                    {leagueGroup?.rounds?.length} rounds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Round Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" /> Rounds
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {leagueGroup?.rounds?.map((round, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedRound === index ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedRound(index)}
                            className={
                              getClanWarsForRound(index).some(
                                (item) =>
                                  item?.isClanInWar &&
                                  item.war.state === "inWar"
                              )
                                ? "border-green-400 dark:border-green-600"
                                : ""
                            }
                          >
                            Day {index + 1}
                            {getClanWarsForRound(index).some(
                              (item) =>
                                item?.isClanInWar && item.war.state === "inWar"
                            ) && (
                              <span className="ml-2">
                                <Badge variant="default">Active</Badge>
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* League Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Trophy className="h-4 w-4 mr-2" /> League
                      </h3>
                      <div className="flex items-center">
                        <Image
                          src={leagueGroup?.warLeague?.iconUrls?.small || ""}
                          alt={leagueGroup?.warLeague?.name || ""}
                          width={32}
                          height={32}
                          className="h-8 w-8 mr-2"
                        />
                        <span className="font-medium">
                          {leagueGroup?.warLeague?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Standings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" /> CWL Standings
                  </CardTitle>
                  <CardDescription>
                    Overall group standings (wins add +10 stars to total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">Rank</th>
                          <th className="px-4 py-2 text-left">Clan</th>
                          <th className="px-4 py-2 text-center">W</th>
                          <th className="px-4 py-2 text-center">L</th>
                          <th className="px-4 py-2 text-center">D</th>
                          <th className="px-4 py-2 text-center">Stars</th>
                          <th className="px-4 py-2 text-center">Destruction</th>
                          <th className="px-4 py-2 text-center">Attacks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculateGroupStandings().map((clan, index) => (
                          <tr
                            key={clan.tag}
                            className={`
                              ${index % 2 === 0 ? "bg-muted/50" : ""}
                              ${
                                clan.tag === clanTag
                                  ? "bg-primary-100 dark:bg-primary-900/30 font-medium"
                                  : ""
                              }
                            `}
                          >
                            <td className="px-4 py-2">#{index + 1}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center">
                                <Image
                                  src={clan.badgeUrl}
                                  alt={clan.name}
                                  width={24}
                                  height={24}
                                  className="h-6 w-6 mr-2"
                                />
                                <span>{clan.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              {clan.wins}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {clan.losses}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {clan.ties}
                            </td>
                            <td className="px-4 py-2 text-center flex items-center justify-center">
                              {clan.stars}{" "}
                              <Star className="h-3 w-3 ml-1 text-yellow-500" />
                            </td>
                            <td className="px-4 py-2 text-center">
                              {(
                                clan.destruction /
                                Math.max(1, clan.wins + clan.losses + clan.ties)
                              ).toFixed(2)}
                              %
                            </td>
                            <td className="px-4 py-2 text-center">
                              {clan.attacksUsed}/{clan.totalAttacks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Round Wars */}
              {selectedRound >= 0 && leagueGroup?.rounds && (
                <Card>
                  <CardHeader>
                    <CardTitle>Round {selectedRound + 1} Matchups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {getClanWarsForRound(selectedRound).map(
                        (item: {
                          warTag: string;
                          war: ClanWarLeagueWar;
                          isClanInWar: boolean;
                          isOurClanAttacking: boolean;
                        }) => {
                          if (!item || !item.war) return null;
                          const { war } = item;

                          // Determine if our clan is in this war and which side
                          const isOurWar = item.isClanInWar;
                          const ourSide = item.isOurClanAttacking
                            ? "clan"
                            : "opponent";

                          // Removing the unused variable
                          // const theirSide = item.isOurClanAttacking ? "opponent" : "clan";

                          return (
                            <Card
                              key={item.warTag}
                              className={`
                              ${isOurWar ? "border-primary border-2" : ""}
                              ${
                                war.state === "inWar"
                                  ? "bg-green-50 dark:bg-green-950/20"
                                  : ""
                              }
                              ${
                                war.state === "preparation"
                                  ? "bg-amber-50 dark:bg-amber-950/20"
                                  : ""
                              }
                            `}
                            >
                              <CardContent className="pt-4">
                                <div className="flex justify-between items-center">
                                  {/* Status Badge */}
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

                                  {/* War Tag */}
                                  <span className="text-xs text-muted-foreground">
                                    {item.warTag}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                  {/* Clan 1 */}
                                  <div
                                    className={`text-center ${
                                      isOurWar && ourSide === "clan"
                                        ? "font-bold"
                                        : ""
                                    }`}
                                  >
                                    <div className="mb-2">
                                      <Image
                                        src={war.clan.badgeUrls.small}
                                        alt={war.clan.name}
                                        width={40}
                                        height={40}
                                        className="inline-block h-10 w-10"
                                      />
                                    </div>
                                    <div className="text-sm max-w-[120px] truncate">
                                      {war.clan.name}
                                    </div>
                                    <div className="text-xl font-bold">
                                      {war.clan.stars}
                                    </div>
                                    <div className="text-sm">
                                      {Math.round(
                                        war.clan.destructionPercentage
                                      )}
                                      %
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {war.clan.attacks} /{" "}
                                      {war.teamSize *
                                        getWarAttacksPerMember(war)}{" "}
                                      attacks
                                    </div>
                                  </div>

                                  <div className="text-2xl font-bold mx-4">
                                    vs
                                  </div>

                                  {/* Clan 2 */}
                                  <div
                                    className={`text-center ${
                                      isOurWar && ourSide === "opponent"
                                        ? "font-bold"
                                        : ""
                                    }`}
                                  >
                                    <div className="mb-2">
                                      <Image
                                        src={war.opponent.badgeUrls.small}
                                        alt={war.opponent.name}
                                        width={40}
                                        height={40}
                                        className="inline-block h-10 w-10"
                                      />
                                    </div>
                                    <div className="text-sm max-w-[120px] truncate">
                                      {war.opponent.name}
                                    </div>
                                    <div className="text-xl font-bold">
                                      {war.opponent.stars}
                                    </div>
                                    <div className="text-sm">
                                      {Math.round(
                                        war.opponent.destructionPercentage
                                      )}
                                      %
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {war.opponent.attacks} /{" "}
                                      {war.teamSize *
                                        getWarAttacksPerMember(war)}{" "}
                                      attacks
                                    </div>
                                  </div>
                                </div>

                                {isOurWar && (
                                  <div className="mt-4 pt-4 border-t">
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                      onClick={() => {
                                        // Open a modal or navigate to a detailed view of this war
                                        router.push(
                                          `/war/details?warTag=${encodeURIComponent(
                                            item.warTag
                                          )}`
                                        );
                                      }}
                                    >
                                      View Details
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
