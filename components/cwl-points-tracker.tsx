"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Trophy,
  Target,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Star,
} from "lucide-react";
import { ClanWarLeagueGroup, ClanWarLeagueWar } from "@/types/clash";
import {
  calculateCWLSeasonPoints,
  getMemberPointsSummary,
  exportPointsToCSV,
} from "@/lib/cwl-points";

interface CWLPointsTrackerProps {
  leagueGroup: ClanWarLeagueGroup;
  allWars: Record<string, ClanWarLeagueWar>;
  clanTag: string;
}

export function CWLPointsTracker({
  leagueGroup,
  allWars,
  clanTag,
}: CWLPointsTrackerProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Calculate points data
  const seasonPoints = useMemo(() => {
    try {
      return calculateCWLSeasonPoints(leagueGroup, allWars, clanTag);
    } catch (error) {
      console.error("Error calculating CWL points:", error);
      return null;
    }
  }, [leagueGroup, allWars, clanTag]);

  if (!seasonPoints) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            CWL Points Tracker
          </CardTitle>
          <CardDescription>
            Unable to calculate points data. Please check if war data is
            available.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleExportCSV = () => {
    const csvData = exportPointsToCSV(seasonPoints);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cwl_points_${seasonPoints.season}_${seasonPoints.clanTag}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getPointsIcon = (points: number) => {
    if (points > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (points < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPointsBadgeVariant = (points: number) => {
    if (points >= 10) return "default";
    if (points >= 5) return "secondary";
    if (points >= 0) return "outline";
    return "destructive";
  };

  const selectedMemberData = selectedMember
    ? seasonPoints.memberPoints.find((m) => m.memberTag === selectedMember)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                CWL Points Tracker
              </CardTitle>
              <CardDescription>
                Season {seasonPoints.season} • {seasonPoints.completedWarDays}{" "}
                of {seasonPoints.totalWarDays} war days completed
              </CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {seasonPoints.memberPoints.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Members
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {seasonPoints.memberPoints.reduce(
                  (sum, m) => sum + m.attacksUsed,
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Attacks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(
                  seasonPoints.memberPoints.reduce(
                    (sum, m) => sum + m.totalPoints,
                    0
                  ) / seasonPoints.memberPoints.length
                )}
              </div>
              <div className="text-sm text-muted-foreground">Avg Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Points System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Offense Points
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    3 Star Attack
                  </span>
                  <Badge variant="default">+2 points</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    2 Star Attack
                  </span>
                  <Badge variant="secondary">+1 point</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    1 Star Attack
                  </span>
                  <Badge variant="destructive">-3 points</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Defense Points
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Perfect Defense (0 stars given)</span>
                  <Badge variant="default">+3 points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>1 Star Defense</span>
                  <Badge variant="default">+2 points</Badge>
                </div>
                <div className="flex justify-between">
                  <span>2 Star Defense</span>
                  <Badge variant="secondary">+1 point</Badge>
                </div>
                <div className="flex justify-between">
                  <span>3 Star Defense</span>
                  <Badge variant="outline">0 points</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          {selectedMemberData && (
            <TabsTrigger value="member-detail">
              {selectedMemberData.memberName}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Points Leaderboard</CardTitle>
              <CardDescription>
                Members ranked by total points earned this season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Attack</TableHead>
                    <TableHead className="text-center">Defense</TableHead>
                    <TableHead className="text-center">Participation</TableHead>
                  </TableRow>
                </TableHeader>{" "}
                <TableBody>
                  {seasonPoints.memberPoints.map((member, index) => {
                    const summary = getMemberPointsSummary(
                      member,
                      seasonPoints.totalWarDays
                    );
                    return (
                      <TableRow
                        key={member.memberTag}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedMember(member.memberTag)}
                      >
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {member.memberName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.memberTag}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getPointsBadgeVariant(member.totalPoints)}
                          >
                            {member.totalPoints}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getPointsIcon(member.attackPoints)}
                            <span>{member.attackPoints}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getPointsIcon(member.defensePoints)}
                            <span>{member.defensePoints}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline">
                                  {member.attacksUsed}/
                                  {seasonPoints.totalWarDays}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {summary.participationRate.toFixed(1)}%
                                participation rate
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance</CardTitle>
              <CardDescription>
                Comprehensive breakdown of member performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-center">
                        Total Points
                      </TableHead>
                      <TableHead className="text-center">
                        Attack Points
                      </TableHead>
                      <TableHead className="text-center">
                        Defense Points
                      </TableHead>
                      <TableHead className="text-center">Avg Attack</TableHead>
                      <TableHead className="text-center">Avg Defense</TableHead>
                      <TableHead className="text-center">
                        Attacks Used
                      </TableHead>
                      <TableHead className="text-center">
                        Times Defended
                      </TableHead>
                    </TableRow>
                  </TableHeader>{" "}
                  <TableBody>
                    {seasonPoints.memberPoints.map((member) => {
                      const summary = getMemberPointsSummary(
                        member,
                        seasonPoints.totalWarDays
                      );
                      return (
                        <TableRow key={member.memberTag}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {member.memberName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.memberTag}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={getPointsBadgeVariant(
                                member.totalPoints
                              )}
                            >
                              {member.totalPoints}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {member.attackPoints}
                          </TableCell>
                          <TableCell className="text-center">
                            {member.defensePoints}
                          </TableCell>
                          <TableCell className="text-center">
                            {summary.avgAttackPoints}
                          </TableCell>
                          <TableCell className="text-center">
                            {summary.avgDefensePoints}
                          </TableCell>
                          <TableCell className="text-center">
                            {member.attacksUsed}
                          </TableCell>
                          <TableCell className="text-center">
                            {member.timesDefended}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedMemberData && (
          <TabsContent value="member-detail">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedMemberData.memberName} Performance
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown for {selectedMemberData.memberTag}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedMemberData.totalPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Points
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedMemberData.attackPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Attack Points
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedMemberData.defensePoints}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Defense Points
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {(
                          (selectedMemberData.attacksUsed /
                            seasonPoints.totalWarDays) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Participation
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attack History */}
              <Card>
                <CardHeader>
                  <CardTitle>Attack History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Round</TableHead>
                        <TableHead>Defender</TableHead>
                        <TableHead>Stars</TableHead>
                        <TableHead>Destruction</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMemberData.attackHistory.map((attack, index) => (
                        <TableRow key={index}>
                          <TableCell>Day {attack.round}</TableCell>
                          <TableCell>{attack.defenderName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array(attack.stars)
                                .fill(0)
                                .map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-3 w-3 fill-yellow-500 text-yellow-500"
                                  />
                                ))}
                            </div>
                          </TableCell>
                          <TableCell>{attack.destructionPercentage}%</TableCell>
                          <TableCell>
                            <Badge
                              variant={getPointsBadgeVariant(attack.points)}
                            >
                              {attack.points > 0 ? "+" : ""}
                              {attack.points}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Defense History */}
              <Card>
                <CardHeader>
                  <CardTitle>Defense History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Round</TableHead>
                        <TableHead>Attacker</TableHead>
                        <TableHead>Stars Given</TableHead>
                        <TableHead>Destruction</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMemberData.defenseHistory.map(
                        (defense, index) => (
                          <TableRow key={index}>
                            <TableCell>Day {defense.round}</TableCell>
                            <TableCell>{defense.attackerName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {Array(defense.starsGiven)
                                  .fill(0)
                                  .map((_, i) => (
                                    <Star
                                      key={i}
                                      className="h-3 w-3 fill-yellow-500 text-yellow-500"
                                    />
                                  ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {defense.destructionPercentage}%
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getPointsBadgeVariant(defense.points)}
                              >
                                {defense.points > 0 ? "+" : ""}
                                {defense.points}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
