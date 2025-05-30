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
import {
  AlertCircle,
  Trophy,
  Clock,
  Star,
  Info,
  BarChart3,
  Calendar,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { fetchWarLeagueData } from "@/lib/api";
import { ClanWarLeagueGroup, ClanWarLeagueWar } from "@/types/clash";
import { calculateTimeRemaining } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { WarLeagueAttacksTable } from "@/components/war-league-attacks-table";
import { CWLPointsTracker } from "@/components/cwl-points-tracker";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WarLeaguePage() {
  const [leagueGroup, setLeagueGroup] = useState<ClanWarLeagueGroup | null>(
    null
  );
  const [leagueWars, setLeagueWars] = useState<{
    [key: string]: ClanWarLeagueWar;
  }>({});
  const [selectedWar, setSelectedWar] = useState<ClanWarLeagueWar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showOverview, setShowOverview] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  const router = useRouter();
  const clanTag = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

  // Helper to determine if we're in a CWL period
  const isInCWL =
    leagueGroup && leagueGroup.rounds && leagueGroup.rounds.length > 0;

  // Define a proper type for the war items
  interface ClanWarLeagueWarItem {
    warTag: string;
    war: ClanWarLeagueWar;
    isClanInWar: boolean;
    isOurClanAttacking: boolean;
  }

  // Helper to get our clan's wars for a round with proper return type
  const getClanWarsForRound = (roundIndex: number): ClanWarLeagueWarItem[] => {
    if (!leagueGroup || !leagueGroup.rounds || !leagueGroup.rounds[roundIndex])
      return [];

    const roundWarTags = leagueGroup.rounds[roundIndex].warTags || [];

    return roundWarTags
      .map((warTag) => {
        if (!warTag) return null;

        const war = leagueWars[warTag];
        if (!war || !war.clan || !war.opponent) return null;

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
      .filter((item): item is ClanWarLeagueWarItem => item !== null);
  };

  // Calculate current round index based on war status
  const getCurrentRoundIndex = () => {
    if (!leagueGroup || !leagueGroup.rounds) return 0;

    // First look for active wars (in preparation or battle day)
    for (let i = 0; i < leagueGroup.rounds.length; i++) {
      const roundWars = getClanWarsForRound(i);
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

    console.log("clanStats", clanStats);
    console.log("leagueGroup", leagueGroup);

    // Process all wars
    Object.values(leagueWars).forEach((war) => {
      if (war.state !== "warEnded") return;

      const clan1 = war.clan;
      const clan2 = war.opponent;

      // Add war results
      if (
        clan1.stars > clan2.stars ||
        (clan1.stars === clan2.stars &&
          clan1.destructionPercentage > clan2.destructionPercentage)
      ) {
        clanStats[clan1.tag].wins++;
        clanStats[clan2.tag].losses++;
        clanStats[clan1.tag].stars += 10;
      } else if (
        clan2.stars > clan1.stars ||
        (clan2.stars === clan1.stars &&
          clan2.destructionPercentage > clan1.destructionPercentage)
      ) {
        clanStats[clan2.tag].wins++;
        clanStats[clan1.tag].losses++;
        clanStats[clan2.tag].stars += 10;
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
      // In CWL, each member gets 1 attack per war
      clanStats[clan1.tag].totalAttacks += clan1.members.length;
      clanStats[clan2.tag].totalAttacks += clan2.members.length;
    });

    // Convert to array and sort
    return Object.values(clanStats).sort((a, b) => {
      // Sort by stars first
      if (a.stars !== b.stars) return b.stars - a.stars;
      // Then by destruction percentage
      return b.destruction - a.destruction;
    });
  };

  // Get our clan's matchups across all rounds
  const getOurClanMatchups = () => {
    if (!leagueGroup || !leagueGroup.rounds) return [];

    const allMatchups: {
      round: number;
      warTag: string;
      war: ClanWarLeagueWar;
      isOurClanAttacking: boolean;
    }[] = [];

    leagueGroup.rounds.forEach((round, roundIndex) => {
      const roundWars = getClanWarsForRound(roundIndex);
      const ourWar = roundWars.find((item) => item.isClanInWar);

      if (ourWar) {
        allMatchups.push({
          round: roundIndex + 1,
          warTag: ourWar.warTag,
          war: ourWar.war,
          isOurClanAttacking: ourWar.isOurClanAttacking,
        });
      }
    });

    return allMatchups;
  };

  // Get detailed standings for all clans
  const getDetailedStandings = () => {
    if (!leagueGroup || !leagueWars) return [];

    // Use the same calculation as before but include more details
    const clanStats = calculateGroupStandings();

    // Add additional stats for each clan
    return clanStats.map((clan) => {
      // Calculate average destruction per war and stars per war
      const warCount = clan.wins + clan.losses + clan.ties;
      const avgDestruction =
        warCount > 0 ? (clan.destruction / warCount).toFixed(2) : "0";
      const avgStars = warCount > 0 ? (clan.stars / warCount).toFixed(1) : "0";
      const attackUsageRate =
        clan.totalAttacks > 0
          ? ((clan.attacksUsed / clan.totalAttacks) * 100).toFixed(0)
          : "0";

      return {
        ...clan,
        avgDestruction,
        avgStars,
        attackUsageRate,
      };
    });
  };

  // Update time remaining for active wars
  useEffect(() => {
    const updateTimeRemaining = () => {
      console.log("updating time remaining for war", selectedWar);
      if (selectedWar && selectedWar.state === "inWar" && selectedWar.endTime) {
        console.log("in war, updating time remaining");
        setTimeRemaining(calculateTimeRemaining(selectedWar.endTime));
      } else if (selectedRound >= 0 && leagueGroup?.rounds) {
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
  }, [leagueWars, selectedRound, leagueGroup, selectedWar]);

  // Fetch CWL data using our new batch endpoint
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Use our batch endpoint to fetch all data at once
        const { group, wars } = await fetchWarLeagueData(clanTag);

        setLeagueGroup(group);
        setLeagueWars(wars || {});

        if (group && group.rounds && group.rounds.length > 0) {
          // Auto-select current round
          const currentRound = getCurrentRoundIndex();
          setSelectedRound(currentRound);

          // Find our war in the current round
          const roundWars = getClanWarsForRound(currentRound);
          const ourWar = roundWars.find((item) => item?.isClanInWar);
          if (ourWar) {
            setSelectedWar(ourWar.war);
          }
        }
      } catch (err) {
        console.error("Error fetching CWL data:", err);
        setError("Failed to load Clan War League data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clanTag]);

  // Handle back to regular war
  const navigateToRegularWar = () => {
    router.push("/war");
  };

  // Handle selecting a war
  const handleSelectWar = (war: ClanWarLeagueWar) => {
    setSelectedWar(war);
  };

  // Render league info card with either hover card or popover based on device
  const LeagueInfoCard = () => {
    const TriggerContent = (
      <div className="flex items-center gap-1 cursor-help">
        <Trophy className="h-4 w-4" />
        <span className="font-medium">
          {leagueGroup?.warLeague?.name || "War League"}
        </span>
      </div>
    );

    const InfoContent = (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={leagueGroup?.warLeague?.iconUrls?.medium || "/placeholder.png"}
            alt={leagueGroup?.warLeague?.name || "League"}
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <div>
            <h4 className="font-bold">{leagueGroup?.warLeague?.name}</h4>
            <p className="text-sm text-muted-foreground">
              Season: {leagueGroup?.season}
            </p>
          </div>
        </div>
        <div className="text-sm">
          <p>{leagueGroup?.clans.length} clans competing</p>
          <p>{leagueGroup?.rounds?.length} rounds total</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Each member gets 1 attack per war
          </p>
        </div>
      </div>
    );

    if (isDesktop) {
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div>{TriggerContent}</div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">{InfoContent}</HoverCardContent>
        </HoverCard>
      );
    } else {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div>{TriggerContent}</div>
          </PopoverTrigger>
          <PopoverContent className="w-80">{InfoContent}</PopoverContent>
        </Popover>
      );
    }
  };

  // Add a helper function to determine matchup border color
  const getMatchupBorderClass = (
    war: ClanWarLeagueWar,
    isOurClanAttacking: boolean
  ): string => {
    // For wars that haven't ended yet
    if (war.state !== "warEnded") {
      return "border-primary border-2";
    }

    // For ended wars, check if we won
    const ourClan = isOurClanAttacking ? war.clan : war.opponent;
    const theirClan = isOurClanAttacking ? war.opponent : war.clan;

    if (ourClan.stars > theirClan.stars) {
      return "border-green-500 border-2";
    } else if (ourClan.stars < theirClan.stars) {
      return "border-red-500 border-2";
    } else {
      // Tie
      return "border-yellow-500 border-2";
    }
  };

  // Show loading state during initial fetch
  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <h1 className="text-3xl font-bold">Clan War League</h1>
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading war league data...</p>
        </div>
      </div>
    );
  }

  // Show error state if fetch failed
  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <h1 className="text-3xl font-bold">Clan War League</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={navigateToRegularWar}>View Regular War</Button>
      </div>
    );
  }

  // Rest of the component remains the same
  return (
    <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Clan War League</h1>
        <Button
          variant="outline"
          onClick={navigateToRegularWar}
          className="w-full sm:w-auto mt-2 sm:mt-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Regular War
        </Button>
      </div>

      {/* Time Remaining Alert */}
      {timeRemaining && (
        <Alert className="bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800">
          <Clock className="h-4 w-4" />
          <AlertTitle>Time Remaining</AlertTitle>
          <AlertDescription className="font-mono text-sm sm:text-lg">
            {timeRemaining}
          </AlertDescription>
        </Alert>
      )}

      {!isInCWL ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No CWL Data</AlertTitle>
          <AlertDescription>
            The clan is not currently participating in Clan War League.
            <Button variant="link" onClick={navigateToRegularWar}>
              Check Regular War
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left sidebar - better responsive handling */}
          <div className="md:col-span-1 flex flex-col gap-4">
            {/* CWL Overview Card */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>CWL Season</span>
                  <LeagueInfoCard />
                </CardTitle>
                <CardDescription>
                  {leagueGroup?.season} - {leagueGroup?.clans.length} Clans
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> Rounds
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      variant={showOverview ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowOverview(!showOverview);
                        setShowPoints(false);
                      }}
                      className="text-xs h-7"
                    >
                      {showOverview ? "Hide Overview" : "Overview"}
                    </Button>
                    <Button
                      variant={showPoints ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowPoints(!showPoints);
                        setShowOverview(false);
                      }}
                      className="text-xs h-7"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {showPoints ? "Hide Points" : "Points"}
                    </Button>
                  </div>
                </div>
                {/* Round selector buttons - better responsive design */}
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                  {leagueGroup?.rounds?.map((round, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedRound === index && !showOverview
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setSelectedRound(index);
                        setShowOverview(false);
                        setShowPoints(false);
                      }}
                      className={
                        getClanWarsForRound(index).some(
                          (item) =>
                            item?.isClanInWar && item.war.state === "inWar"
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
                        <span className="ml-1 bg-green-400 dark:bg-green-600 rounded-full h-1.5 w-1.5 p-0" />
                      )}
                    </Button>
                  ))}
                </div>{" "}
                {/* Matchups section - improved */}
                {!showOverview && !showPoints ? (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-semibold">
                      Round {selectedRound + 1} Matchups
                    </h3>
                    {getClanWarsForRound(selectedRound).map(
                      (item: ClanWarLeagueWarItem) => {
                        if (!item || !item.war) return null;
                        const { war } = item;
                        const isOurWar = item.isClanInWar;
                        const isSelected = selectedWar && selectedWar === war;

                        return (
                          <div
                            key={item.warTag}
                            className={`
                              p-2 rounded cursor-pointer
                              ${
                                isOurWar
                                  ? getMatchupBorderClass(
                                      war,
                                      item.isOurClanAttacking
                                    )
                                  : "border"
                              }
                              ${isSelected ? "bg-accent" : "hover:bg-accent/50"}
                            `}
                            onClick={() => handleSelectWar(war)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <img
                                  src={war.clan.badgeUrls.small}
                                  alt={war.clan.name}
                                  className="h-6 w-6"
                                />
                                <span className="text-xs">{war.clan.name}</span>
                              </div>
                              <span className="text-xs font-semibold">vs</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs">
                                  {war.opponent.name}
                                </span>
                                <img
                                  src={war.opponent.badgeUrls.small}
                                  alt={war.opponent.name}
                                  className="h-6 w-6"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-xs">
                              <span>{war.clan.stars} ⭐</span>
                              <Badge
                                variant={
                                  war.state === "inWar"
                                    ? "default"
                                    : war.state === "preparation"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-[10px] h-5"
                              >
                                {war.state === "inWar"
                                  ? "Battle Day"
                                  : war.state === "preparation"
                                  ? "Preparation"
                                  : "Ended"}
                              </Badge>
                              <span>{war.opponent.stars} ⭐</span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : showOverview ? (
                  <div className="space-y-4 mt-4">
                    {/* Overview Mode - Our Clan's Wars */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        Our Clan&apos;s Matchups
                      </h3>
                      {getOurClanMatchups().map((matchup) => {
                        const { war, round, isOurClanAttacking } = matchup;
                        const ourClan = isOurClanAttacking
                          ? war.clan
                          : war.opponent;
                        const theirClan = isOurClanAttacking
                          ? war.opponent
                          : war.clan;

                        return (
                          <div
                            key={matchup.warTag}
                            className={`
                              p-2 rounded cursor-pointer mb-2
                              ${getMatchupBorderClass(war, isOurClanAttacking)}
                              ${
                                selectedWar && selectedWar === war
                                  ? "bg-accent"
                                  : "hover:bg-accent/50"
                              }
                              ${
                                war.state === "inWar"
                                  ? "bg-green-50/30 dark:bg-green-950/20"
                                  : ""
                              }
                            `}
                            onClick={() => {
                              handleSelectWar(war);
                              setSelectedRound(round - 1);
                              setShowOverview(false);
                              setShowPoints(false);
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <Badge className="mr-2">Day {round}</Badge>
                              <div className="flex-grow flex justify-between items-center">
                                <div className="flex items-center">
                                  <img
                                    src={ourClan.badgeUrls.small}
                                    alt={ourClan.name}
                                    className="h-6 w-6 mr-1"
                                  />
                                  <span className="text-xs font-medium">
                                    {ourClan.name}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold mx-2">
                                  vs
                                </span>
                                <div className="flex items-center">
                                  <span className="text-xs">
                                    {theirClan.name}
                                  </span>
                                  <img
                                    src={theirClan.badgeUrls.small}
                                    alt={theirClan.name}
                                    className="h-6 w-6 ml-1"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-xs">
                              <div className="flex items-center">
                                <span>{ourClan.stars}</span>
                                <Star className="h-3 w-3 ml-0.5 fill-yellow-500 text-yellow-500" />
                              </div>
                              <Badge
                                variant={
                                  war.state === "inWar"
                                    ? "default"
                                    : war.state === "preparation"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-[10px] h-5"
                              >
                                {war.state === "inWar"
                                  ? "Battle Day"
                                  : war.state === "preparation"
                                  ? "Preparation"
                                  : "Ended"}
                              </Badge>
                              <div className="flex items-center">
                                <span>{theirClan.stars}</span>
                                <Star className="h-3 w-3 ml-0.5 fill-yellow-500 text-yellow-500" />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {getOurClanMatchups().length === 0 && (
                        <div className="text-center p-4 border rounded-md bg-muted/20">
                          <p className="text-sm text-muted-foreground">
                            No matchups found for our clan
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expanded Standings */}
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2">
                        Detailed Standings
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="px-2 py-1 text-left">#</th>
                              <th className="px-2 py-1 text-left">Clan</th>
                              <th className="px-2 py-1 text-center">W-L-D</th>
                              <th className="px-2 py-1 text-center">⭐</th>
                              <th className="px-2 py-1 text-center">Avg ⭐</th>
                              <th className="px-2 py-1 text-center">Avg %</th>
                              <th className="px-2 py-1 text-center">Attacks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getDetailedStandings().map((clan, index) => (
                              <tr
                                key={clan.tag}
                                className={`
                                ${index % 2 === 0 ? "bg-muted/30" : ""}
                                ${
                                  clan.tag === clanTag
                                    ? "font-medium bg-primary/10"
                                    : ""
                                }
                              `}
                              >
                                <td className="px-2 py-1">{index + 1}</td>
                                <td className="px-2 py-1">
                                  <div className="flex items-center">
                                    <img
                                      src={clan.badgeUrl}
                                      alt={clan.name}
                                      className="h-4 w-4 mr-1"
                                    />
                                    <span className="truncate max-w-[80px]">
                                      {clan.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-2 py-1 text-center">
                                  {clan.wins}-{clan.losses}-{clan.ties}
                                </td>
                                <td className="px-2 py-1 text-center">
                                  {clan.stars}
                                </td>
                                <td className="px-2 py-1 text-center">
                                  {clan.avgStars}
                                </td>
                                <td className="px-2 py-1 text-center">
                                  {clan.avgDestruction}%
                                </td>
                                <td className="px-2 py-1 text-center">
                                  {clan.attacksUsed}/{clan.totalAttacks}
                                  <span className="text-[10px] ml-1 text-muted-foreground">
                                    ({clan.attackUsageRate}%)
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>{" "}
                      </div>
                    </div>
                  </div>
                ) : showPoints ? (
                  <div className="mt-4">
                    <CWLPointsTracker
                      leagueGroup={leagueGroup}
                      allWars={leagueWars}
                      clanTag={clanTag}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>{" "}
            {/* Standings Card - Only show in non-overview mode */}
            {!showOverview && !showPoints && (
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-4 w-4 mr-2" /> Standings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 text-xs text-left">#</th>
                          <th className="px-2 py-1 text-xs text-left">Clan</th>
                          <th className="px-2 py-1 text-xs text-center">
                            W-L-D
                          </th>
                          <th className="px-2 py-1 text-xs text-center">⭐</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculateGroupStandings().map((clan, index) => (
                          <tr
                            key={clan.tag}
                            className={`
                            ${index % 2 === 0 ? "bg-muted/30" : ""}
                            ${
                              clan.tag === clanTag
                                ? "font-medium bg-primary/10"
                                : ""
                            }
                          `}
                          >
                            <td className="px-2 py-1 text-xs">{index + 1}</td>
                            <td className="px-2 py-1 text-xs">
                              <div className="flex items-center">
                                <img
                                  src={clan.badgeUrl}
                                  alt={clan.name}
                                  className="h-4 w-4 mr-1"
                                />
                                <span className="truncate max-w-[80px]">
                                  {clan.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-1 text-xs text-center">
                              {clan.wins}-{clan.losses}-{clan.ties}
                            </td>
                            <td className="px-2 py-1 text-xs text-center">
                              {clan.stars}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected War Display - more responsive */}
          <div className="md:col-span-2">
            {selectedWar ? (
              <>
                {/* War Overview - more responsive */}
                <Card className="mb-4 md:mb-6">
                  <CardHeader className="px-4 py-0 pb-2">
                    <CardTitle>War Details</CardTitle>
                    <CardDescription>
                      {selectedWar.state === "preparation"
                        ? "Preparation Day"
                        : selectedWar.state === "inWar"
                        ? "Battle Day"
                        : "War Ended"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {/* Updated more responsive layout for war details */}
                    <div className="flex flex-row justify-between items-center rounded-lg py-2">
                      {/* Clan 1 */}
                      <div className="flex flex-col items-center justify-center text-center w-full sm:w-auto mb-4 sm:mb-0">
                        <div className="mb-2">
                          <Image
                            src={selectedWar.clan.badgeUrls.small}
                            alt={selectedWar.clan.name}
                            width={40}
                            height={40}
                            className="inline-block h-10 w-10"
                          />
                        </div>
                        <div className="font-medium truncate max-w-[160px] mx-auto sm:max-w-[120px]">
                          {selectedWar.clan.name}
                        </div>
                        <div className="text-2xl font-bold flex items-center justify-center">
                          {selectedWar.clan.stars}
                          <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                        </div>
                        <div className="text-sm">
                          {Math.round(selectedWar.clan.destructionPercentage)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedWar.clan.attacks}/{selectedWar.teamSize}{" "}
                          attacks
                        </div>
                      </div>

                      <div className="text-xl font-bold mx-2 sm:mx-4">vs</div>

                      {/* Clan 2 */}
                      <div className="flex flex-col items-center justify-center text-center w-full sm:w-auto">
                        <div className="mb-2">
                          <Image
                            src={selectedWar.opponent.badgeUrls.small}
                            alt={selectedWar.opponent.name}
                            width={40}
                            height={40}
                            className="inline-block h-10 w-10"
                          />
                        </div>
                        <div className="font-medium truncate max-w-[160px] mx-auto sm:max-w-[120px]">
                          {selectedWar.opponent.name}
                        </div>
                        <div className="text-2xl font-bold flex items-center justify-center">
                          {selectedWar.opponent.stars}
                          <Star className="h-4 w-4 ml-1 fill-yellow-500 text-yellow-500" />
                        </div>
                        <div className="text-sm">
                          {Math.round(
                            selectedWar.opponent.destructionPercentage
                          )}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedWar.opponent.attacks}/{selectedWar.teamSize}{" "}
                          attacks
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attack Tables with Tabs - improved responsive design */}
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle>War Attacks</CardTitle>
                    <CardDescription className="hidden sm:block">
                      Each member gets 1 attack in CWL
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-4 pt-0">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="clan">
                          <div className="flex items-center">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 overflow-hidden rounded-full">
                              <Image
                                src={selectedWar.clan.badgeUrls.small}
                                alt=""
                                width={16}
                                height={16}
                              />
                            </div>
                            <span className="truncate max-w-[60px] sm:max-w-full">
                              {selectedWar.clan.name}
                            </span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="opponent">
                          <div className="flex items-center">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 overflow-hidden rounded-full">
                              <Image
                                src={selectedWar.opponent.badgeUrls.small}
                                alt=""
                                width={16}
                                height={16}
                              />
                            </div>
                            <span className="truncate max-w-[60px] sm:max-w-full">
                              {selectedWar.opponent.name}
                            </span>
                          </div>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all">
                        <WarLeagueAttacksTable warData={selectedWar} />
                      </TabsContent>

                      <TabsContent value="clan">
                        <WarLeagueAttacksTable
                          warData={selectedWar}
                          showOnlyClan={true}
                        />
                      </TabsContent>

                      <TabsContent value="opponent">
                        <WarLeagueAttacksTable
                          warData={selectedWar}
                          showOnlyOpponent={true}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="h-[60vh] sm:h-[70vh] flex items-center justify-center">
                <div className="text-center p-6 bg-muted/50 rounded-lg max-w-md">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold">Select a War</h3>
                  <p className="text-muted-foreground mt-2">
                    Choose a war from the matchups list to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
