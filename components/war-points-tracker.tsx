"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trophy,
  Download,
  Star,
  Shield,
  Swords,
  TrendingUp,
  Users,
  Info,
} from "lucide-react";
import { ClanWar } from "@/types/clash";
import {
  calculateWarPoints,
  exportWarPointsToCSV,
  WarMemberPoints,
} from "@/lib/war-points";

interface WarPointsTrackerProps {
  war: ClanWar;
  clanTag: string;
}

export function WarPointsTracker({ war, clanTag }: WarPointsTrackerProps) {
  const [selectedMember, setSelectedMember] = useState<WarMemberPoints | null>(
    null
  );

  // Calculate points data
  const warPoints = useMemo(() => {
    return calculateWarPoints(war, clanTag);
  }, [war, clanTag]);

  // Statistics
  const stats = useMemo(() => {
    const { memberPoints } = warPoints;
    const totalMembers = memberPoints.length;
    const membersWithAttacks = memberPoints.filter(
      (m) => m.attacksUsed > 0
    ).length;
    const perfectAttackers = memberPoints.filter(
      (m) =>
        m.attackHistory.every((attack) => attack.stars === 3) &&
        m.attacksUsed > 0
    ).length;
    const totalAttacksUsed = memberPoints.reduce(
      (sum, m) => sum + m.attacksUsed,
      0
    );
    const maxPossibleAttacks = totalMembers * 2;

    return {
      totalMembers,
      membersWithAttacks,
      perfectAttackers,
      totalAttacksUsed,
      maxPossibleAttacks,
      attackUsageRate: ((totalAttacksUsed / maxPossibleAttacks) * 100).toFixed(
        1
      ),
    };
  }, [warPoints]);

  // Handle CSV export
  const handleExport = () => {
    const csvContent = exportWarPointsToCSV(warPoints);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `war-points-${war.warTag || "current"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getPointsColor = (points: number) => {
    if (points >= 4) return "text-green-600";
    if (points >= 2) return "text-emerald-600";
    if (points >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getPositionSuffix = (position: number) => {
    if (position === 1) return "st";
    if (position === 2) return "nd";
    if (position === 3) return "rd";
    return "th";
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            War Points Tracker
          </h2>
          <p className="text-muted-foreground">
            Performance tracking based on attack and defense points
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Swords className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Attack Usage</p>
                <p className="text-2xl font-bold">{stats.attackUsageRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Perfect Attackers</p>
                <p className="text-2xl font-bold">{stats.perfectAttackers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Points</p>
                <p className="text-2xl font-bold">
                  {warPoints.totalAttackPoints + warPoints.totalDefensePoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="scoring">Scoring System</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points Leaderboard</CardTitle>
              <CardDescription>
                Ranking based on total points (attack + defense)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-center">TH</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-center">Attack Pts</TableHead>
                    <TableHead className="text-center">Defense Pts</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Attacks Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warPoints.memberPoints.map((member, index) => (
                    <TableRow
                      key={member.memberTag}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedMember(member)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index + 1}
                          {index === 0 && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                          {index === 1 && (
                            <Trophy className="h-4 w-4 text-gray-400" />
                          )}
                          {index === 2 && (
                            <Trophy className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {member.memberName}
                      </TableCell>
                      <TableCell className="text-center">
                        {member.townHallLevel}
                      </TableCell>
                      <TableCell className="text-center">
                        {member.mapPosition}
                      </TableCell>
                      <TableCell
                        className={`text-center ${getPointsColor(
                          member.attackPoints
                        )}`}
                      >
                        {member.attackPoints}
                      </TableCell>
                      <TableCell
                        className={`text-center ${getPointsColor(
                          member.defensePoints
                        )}`}
                      >
                        {member.defensePoints}
                      </TableCell>
                      <TableCell
                        className={`text-center font-bold ${getPointsColor(
                          member.totalPoints
                        )}`}
                      >
                        {member.totalPoints}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            member.attacksUsed === 2
                              ? "default"
                              : member.attacksUsed === 1
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {member.attacksUsed}/2
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Attackers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-red-500" />
                  Top Attackers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warPoints.memberPoints
                    .filter((m) => m.attackPoints > 0)
                    .sort((a, b) => b.attackPoints - a.attackPoints)
                    .slice(0, 5)
                    .map((member, index) => (
                      <div
                        key={member.memberTag}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-sm">
                            {index + 1}
                            {getPositionSuffix(index + 1)}
                          </span>
                          <span className="font-medium">
                            {member.memberName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {member.attacksUsed}/2
                          </Badge>
                          <span
                            className={`font-bold ${getPointsColor(
                              member.attackPoints
                            )}`}
                          >
                            {member.attackPoints}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Defenders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Top Defenders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warPoints.memberPoints
                    .filter((m) => m.defensePoints > 0)
                    .sort((a, b) => b.defensePoints - a.defensePoints)
                    .slice(0, 5)
                    .map((member, index) => (
                      <div
                        key={member.memberTag}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-sm">
                            {index + 1}
                            {getPositionSuffix(index + 1)}
                          </span>
                          <span className="font-medium">
                            {member.memberName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {member.timesDefended}x
                          </Badge>
                          <span
                            className={`font-bold ${getPointsColor(
                              member.defensePoints
                            )}`}
                          >
                            {member.defensePoints}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-red-500" />
                  Attack Points
                </CardTitle>
                <CardDescription>
                  Points earned for attacks made
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>3 Star Attack</span>
                  </div>
                  <Badge className="bg-green-600">+2 points</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Star className="h-4 w-4 text-gray-300" />
                    <span>2 Star Attack</span>
                  </div>
                  <Badge className="bg-yellow-600">+1 point</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Star className="h-4 w-4 text-gray-300" />
                    <Star className="h-4 w-4 text-gray-300" />
                    <span>1 Star Attack</span>
                  </div>
                  <Badge variant="destructive">-3 points</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-300" />
                    <Star className="h-4 w-4 text-gray-300" />
                    <Star className="h-4 w-4 text-gray-300" />
                    <span>0 Star Attack</span>
                  </div>
                  <Badge variant="destructive">-3 points</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Defense Points
                </CardTitle>
                <CardDescription>
                  Points earned for successful defenses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Perfect Defense (0 stars given)</span>
                  </div>
                  <Badge className="bg-green-600">+3 points</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>Strong Defense (1 star given)</span>
                  </div>
                  <Badge className="bg-emerald-600">+2 points</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <span>OK Defense (2 stars given)</span>
                  </div>
                  <Badge className="bg-yellow-600">+1 point</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span>Failed Defense (3 stars given)</span>
                  </div>
                  <Badge variant="secondary">0 points</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                War Points System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Attack Rules:</strong> Each member can make up to 2
                  attacks in regular wars. The goal is to maximize stars while
                  minimizing failed attacks.
                </p>
                <p>
                  <strong>Defense Rules:</strong> Defense points are
                  automatically awarded based on how well your base defends
                  against enemy attacks. Multiple attacks on the same base all
                  count.
                </p>
                <p>
                  <strong>Total Score:</strong> Your final score is the sum of
                  all attack points and defense points. The member with the
                  highest total wins.
                </p>
                <p>
                  <strong>Strategy:</strong> Aim for 3-star attacks while
                  building bases that force 2-star or fewer results.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Detail Dialog */}
      <Dialog
        open={!!selectedMember}
        onOpenChange={() => setSelectedMember(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {selectedMember?.memberName} - Detailed Performance
            </DialogTitle>
            <DialogDescription>
              Complete attack and defense breakdown for this war
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Member Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Total Points
                    </p>
                    <p
                      className={`text-2xl font-bold ${getPointsColor(
                        selectedMember.totalPoints
                      )}`}
                    >
                      {selectedMember.totalPoints}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Attack Points
                    </p>
                    <p
                      className={`text-2xl font-bold ${getPointsColor(
                        selectedMember.attackPoints
                      )}`}
                    >
                      {selectedMember.attackPoints}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Defense Points
                    </p>
                    <p
                      className={`text-2xl font-bold ${getPointsColor(
                        selectedMember.defensePoints
                      )}`}
                    >
                      {selectedMember.defensePoints}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Attacks Used
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedMember.attacksUsed}/2
                    </p>
                  </div>
                </div>

                {/* Attacks */}
                {selectedMember.attackHistory.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Swords className="h-4 w-4" />
                      Attacks Made
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Defender</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Stars</TableHead>
                          <TableHead>Destruction</TableHead>
                          <TableHead>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedMember.attackHistory.map((attack, index) => (
                          <TableRow key={index}>
                            <TableCell>{attack.attackOrder}</TableCell>
                            <TableCell>{attack.defenderName}</TableCell>
                            <TableCell>#{attack.defenderPosition}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 3 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < attack.stars
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {attack.destructionPercentage}%
                            </TableCell>
                            <TableCell
                              className={getPointsColor(attack.points)}
                            >
                              {attack.points > 0 ? "+" : ""}
                              {attack.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Defenses */}
                {selectedMember.defenseHistory.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Defenses
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Attacker</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Stars Given</TableHead>
                          <TableHead>Destruction</TableHead>
                          <TableHead>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedMember.defenseHistory.map((defense, index) => (
                          <TableRow key={index}>
                            <TableCell>{defense.attackOrder}</TableCell>
                            <TableCell>{defense.attackerName}</TableCell>
                            <TableCell>#{defense.attackerPosition}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 3 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < defense.starsGiven
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {defense.destructionPercentage}%
                            </TableCell>
                            <TableCell
                              className={getPointsColor(defense.points)}
                            >
                              {defense.points > 0 ? "+" : ""}
                              {defense.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {selectedMember.attackHistory.length === 0 &&
                  selectedMember.defenseHistory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No attacks or defenses recorded for this member yet.
                    </div>
                  )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
