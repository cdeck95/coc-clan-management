"use client";

import { useState, useEffect } from "react";
import { getWarLeagueGroup, getWarLeagueWar } from "@/lib/api";
import { WarLeagueGroup, ClanWarLeagueWar } from "@/types/clash";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "./ui/loading-spinner";
import {
  Shield,
  Swords,
  Calendar,
  ChevronDown,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CWLGroupDisplayProps {
  clanTag: string;
}

export default function CWLGroupDisplay({ clanTag }: CWLGroupDisplayProps) {
  const [cwlGroup, setCwlGroup] = useState<WarLeagueGroup | null>(null);
  const [wars, setWars] = useState<Record<string, ClanWarLeagueWar>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState(0);

  useEffect(() => {
    async function fetchCWLData() {
      try {
        setLoading(true);
        const group = await getWarLeagueGroup(clanTag);
        setCwlGroup(group);

        // If we have war tags, fetch the first round's wars
        if (group?.rounds && group.rounds.length > 0) {
          await fetchRoundWars(group, 0);
        }
      } catch (err) {
        console.error("Error loading CWL group data:", err);
        setError(
          "Failed to load CWL data. The clan may not be participating in CWL currently."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCWLData();
  }, [clanTag]);

  const fetchRoundWars = async (group: WarLeagueGroup, roundIndex: number) => {
    if (!group.rounds || roundIndex >= group.rounds.length) return;

    const warTags = group.rounds[roundIndex].warTags.filter(
      (tag) => tag !== "#0"
    );
    const warDetailsPromises = warTags.map((tag) => getWarLeagueWar(tag));

    try {
      const warDetails = await Promise.all(warDetailsPromises);
      const warMap: Record<string, ClanWarLeagueWar> = {};

      warTags.forEach((tag, i) => {
        warMap[tag] = warDetails[i];
      });

      setWars((prev) => ({ ...prev, ...warMap }));
    } catch (error) {
      console.error("Error loading CWL war details:", error);
    }
  };

  const handleRoundChange = async (index: number) => {
    setActiveRound(index);

    // If we don't have the wars for this round yet, fetch them
    if (
      cwlGroup &&
      !cwlGroup.rounds[index].warTags.some((tag) => tag !== "#0" && wars[tag])
    ) {
      await fetchRoundWars(cwlGroup, index);
    }
  };

  const findClanWar = (roundIndex: number, clanTag: string) => {
    if (!cwlGroup?.rounds || !cwlGroup.rounds[roundIndex]) return null;

    const warTags = cwlGroup.rounds[roundIndex].warTags;

    for (const tag of warTags) {
      if (tag === "#0") continue;

      const war = wars[tag];
      if (war && (war.clan.tag === clanTag || war.opponent.tag === clanTag)) {
        return war;
      }
    }

    return null;
  };

  //   const getWarResultBadge = (war: ClanWarLeagueWar, clanTag: string) => {
  //     if (war.state === "preparation" || war.state === "inWar") {
  //       return (
  //         <Badge variant="outline">
  //           {war.state === "preparation" ? "Prep Day" : "War Day"}
  //         </Badge>
  //       );
  //     }

  //     const isClanAttacker = war.clan.tag === clanTag;
  //     const clanSide = isClanAttacker ? war.clan : war.opponent;
  //     const opponentSide = isClanAttacker ? war.opponent : war.clan;

  //     if (clanSide.stars > opponentSide.stars) {
  //       return <Badge variant="default">Won</Badge>;
  //     } else if (clanSide.stars < opponentSide.stars) {
  //       return <Badge variant="destructive">Lost</Badge>;
  //     } else if (
  //       clanSide.destructionPercentage > opponentSide.destructionPercentage
  //     ) {
  //       return <Badge variant="default">Won (Percentage)</Badge>;
  //     } else if (
  //       clanSide.destructionPercentage < opponentSide.destructionPercentage
  //     ) {
  //       return <Badge variant="destructive">Lost (Percentage)</Badge>;
  //     } else {
  //       return <Badge variant="outline">Draw</Badge>;
  //     }
  //   };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CWL Group</CardTitle>
          <CardDescription>Loading CWL information</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !cwlGroup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CWL Group</CardTitle>
          <CardDescription>Error</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error ||
              "No CWL group data available. The clan may not be in CWL currently."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            <div>
              <CardTitle>Clan War League</CardTitle>
              <CardDescription>
                {cwlGroup.season} - {cwlGroup.state}
              </CardDescription>
            </div>
          </div>
          {"warLeague" in cwlGroup && cwlGroup.warLeague && (
            <Badge variant="outline" className="ml-2">
              {cwlGroup.warLeague.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clans" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="clans">Clans</TabsTrigger>
            <TabsTrigger value="rounds">Rounds</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>

          <TabsContent value="clans" className="space-y-4">
            {cwlGroup.clans.map((clan) => (
              <Collapsible key={clan.tag} className="border rounded-lg p-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex justify-between w-full p-2 h-auto"
                  >
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>{clan.name}</span>
                      <Badge className="ml-2" variant="outline">
                        Level {clan.clanLevel}
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 pt-2 pl-4">
                    <h4 className="text-sm font-medium flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Members ({clan.members.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {clan.members.map((member) => (
                        <div
                          key={member.tag}
                          className="text-xs p-1 bg-muted rounded-sm flex justify-between"
                        >
                          <span>{member.name}</span>
                          <span>TH{member.townHallLevel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TabsContent>

          <TabsContent value="rounds">
            {cwlGroup.rounds.length > 0 ? (
              <div className="space-y-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {cwlGroup.rounds.map((_, index) => (
                    <Button
                      key={index}
                      variant={activeRound === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRoundChange(index)}
                    >
                      Round {index + 1}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  {cwlGroup.rounds[activeRound].warTags.map((warTag, index) => {
                    if (warTag === "#0") {
                      return (
                        <Card key={index} className="bg-muted/30">
                          <CardContent className="p-3">
                            <div className="text-sm text-center text-muted-foreground">
                              War not started
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    const war = wars[warTag];
                    if (!war) {
                      return (
                        <Card key={warTag} className="bg-muted/30">
                          <CardContent className="p-3 flex justify-center">
                            <LoadingSpinner className="h-5 w-5" />
                          </CardContent>
                        </Card>
                      );
                    }

                    return (
                      <Card key={warTag} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-7 items-center">
                            <div className="col-span-3 p-3 text-right">
                              <div className="font-medium">{war.clan.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {war.clan.stars} ⭐ |{" "}
                                {war.clan.destructionPercentage.toFixed(2)}%
                              </div>
                            </div>
                            <div className="col-span-1 p-2 flex justify-center">
                              <Swords className="h-5 w-5" />
                            </div>
                            <div className="col-span-3 p-3">
                              <div className="font-medium">
                                {war.opponent.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {war.opponent.stars} ⭐ |{" "}
                                {war.opponent.destructionPercentage.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted p-2 flex justify-between items-center text-xs">
                            <span>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(war.startTime).toLocaleDateString()}
                            </span>
                            <Badge
                              variant={
                                war.state === "inWar" ? "default" : "outline"
                              }
                            >
                              {war.state}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No rounds available
              </div>
            )}
          </TabsContent>

          <TabsContent value="standings">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-2 text-left">Rank</th>
                    <th className="px-3 py-2 text-left">Clan</th>
                    <th className="px-3 py-2 text-center">Stars</th>
                    <th className="px-3 py-2 text-center">Destruction %</th>
                    <th className="px-3 py-2 text-center">Attacks Used</th>
                  </tr>
                </thead>
                <tbody>
                  {/* This would normally come from the API but we'll compute it */}
                  {/* As a placeholder, we'll just show the clans in the order they appear */}
                  {cwlGroup.clans.map((clan, index) => {
                    // Calculate the clan's performance across all completed wars
                    let totalStars = 0;
                    let totalDestruction = 0;
                    let totalAttacks = 0;
                    let warsCount = 0;

                    cwlGroup.rounds.forEach((round, roundIndex) => {
                      const war = findClanWar(roundIndex, clan.tag);
                      if (war && war.state === "warEnded") {
                        warsCount++;
                        const clanInWar =
                          war.clan.tag === clan.tag ? war.clan : war.opponent;
                        totalStars += clanInWar.stars;
                        totalDestruction += clanInWar.destructionPercentage;
                        totalAttacks += clanInWar.attacks || 0;
                      }
                    });

                    return (
                      <tr key={clan.tag} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 font-medium">{clan.name}</td>
                        <td className="px-3 py-2 text-center">{totalStars}</td>
                        <td className="px-3 py-2 text-center">
                          {warsCount > 0
                            ? (totalDestruction / warsCount).toFixed(2)
                            : "0.00"}
                          %
                        </td>
                        <td className="px-3 py-2 text-center">
                          {totalAttacks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
