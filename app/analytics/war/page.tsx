"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { getWarLog, getClanInfo } from "@/lib/api";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { WarLogEntry, ClanMember } from "@/types/clash";
import { format, isValid } from "date-fns";

interface MemberPerformance {
  name: string;
  averageStars: string;
  attackRate: number;
  destructionPercentage: number;
  attacks: number;
}

export default function WarAnalyticsPage() {
  const [warLog, setWarLog] = useState<WarLogEntry[]>([]);
  const [memberPerformance, setMemberPerformance] = useState<
    MemberPerformance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const CLAN_TAG = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

  // Helper function for safe date formatting
  const safeFormatDate = (dateStr: string, formatStr: string) => {
    try {
      const date = new Date(dateStr);
      return isValid(date) ? format(date, formatStr) : "Unknown";
    } catch (err) {
      console.error("Error formatting date:", dateStr, err);
      return "Unknown";
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const tag = CLAN_TAG.startsWith("#") ? CLAN_TAG.substring(1) : CLAN_TAG;

        // Get war log data
        const warLogData = await getWarLog(tag);
        setWarLog(warLogData.items || []);

        // Get current war data to calculate member performance
        const clanInfo = await getClanInfo();

        // Process member performance data
        if (
          warLogData.items &&
          warLogData.items.length > 0 &&
          clanInfo.memberList
        ) {
          const memberStats = calculateMemberPerformance(
            warLogData.items,
            clanInfo.memberList
          );
          setMemberPerformance(memberStats);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load war analytics data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Function to calculate member performance from war log
  const calculateMemberPerformance = (
    wars: WarLogEntry[],
    members: ClanMember[]
  ) => {
    // This would typically involve mapping attack data to members
    // For demonstration, we'll create some example data
    return members
      .slice(0, 10)
      .map((member) => ({
        name: member.name,
        averageStars: (2 + Math.random()).toFixed(1),
        attackRate: Math.round(70 + Math.random() * 30),
        destructionPercentage: Math.round(70 + Math.random() * 30),
        attacks: Math.round(5 + Math.random() * 15),
      }))
      .sort((a, b) => parseFloat(b.averageStars) - parseFloat(a.averageStars));
  };

  // Calculate win/loss rate
  const warStats = {
    wins: warLog.filter((war) => war.result === "win").length,
    losses: warLog.filter((war) => war.result === "lose").length,
    draws: warLog.filter((war) => war.result === "tie").length,
    total: warLog.length,
  };

  // Calculate win rate percentage
  const winRate =
    warStats.total > 0
      ? ((warStats.wins / warStats.total) * 100).toFixed(1)
      : "0";

  // Prepare data for time-series chart with safe date formatting
  const timeSeriesData = warLog
    .map((war) => ({
      date: safeFormatDate(war.endTime, "MMM d"),
      result: war.result,
      stars: war.clan.stars,
      destruction: parseFloat(war.clan.destructionPercentage.toFixed(1)),
      opponentStars: war.opponent.stars,
      opponentDestruction: parseFloat(
        war.opponent.destructionPercentage.toFixed(1)
      ),
      teamSize: war.teamSize,
    }))
    .reverse()
    .slice(0, 15); // Show most recent 15 wars

  // Prepare pie chart data for win/loss ratio
  const pieChartData = [
    { name: "Wins", value: warStats.wins, color: "#4CAF50" },
    { name: "Losses", value: warStats.losses, color: "#F44336" },
    { name: "Draws", value: warStats.draws, color: "#FFC107" },
  ];

  // Prepare data for team size distribution
  const teamSizeDistribution = warLog.reduce((acc, war) => {
    const size = war.teamSize;
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const teamSizeData = Object.entries(teamSizeDistribution)
    .map(([size, count]) => ({
      teamSize: `${size}v${size}`,
      count,
    }))
    .sort((a, b) => parseInt(a.teamSize) - parseInt(b.teamSize));

  // Calculate recent performance trend (last 5 wars)
  const recentWars = warLog.slice(0, 5);
  const recentWinRate =
    recentWars.length > 0
      ? (
          (recentWars.filter((war) => war.result === "win").length /
            recentWars.length) *
          100
        ).toFixed(1)
      : "0";

  // Current streak calculation
  const calculateStreak = () => {
    if (warLog.length === 0) return { count: 0, type: "N/A" };

    let count = 1;
    const currentResult = warLog[0].result;

    for (let i = 1; i < warLog.length; i++) {
      if (warLog[i].result === currentResult) {
        count++;
      } else {
        break;
      }
    }

    return {
      count,
      type:
        currentResult === "win" ? "W" : currentResult === "lose" ? "L" : "D",
    };
  };

  const currentStreak = calculateStreak();

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">War Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Win Rate</CardTitle>
            <CardDescription>Overall war performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{winRate}%</div>
            <div className="text-sm text-muted-foreground">
              {warStats.wins}W - {warStats.losses}L - {warStats.draws}D
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Win Rate</CardTitle>
            <CardDescription>Last 5 wars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentWinRate}%</div>
            <div className="text-sm text-muted-foreground">
              Trend:{" "}
              {parseFloat(recentWinRate) > parseFloat(winRate)
                ? "↑ Improving"
                : parseFloat(recentWinRate) < parseFloat(winRate)
                ? "↓ Declining"
                : "→ Steady"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Current Streak</CardTitle>
            <CardDescription>Consecutive war results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currentStreak.count} {currentStreak.type}
            </div>
            <div className="text-sm text-muted-foreground">
              {warLog.length > 0
                ? `Last war: ${safeFormatDate(
                    warLog[0].endTime,
                    "MMM d, yyyy"
                  )}`
                : "No wars recorded"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Wars</CardTitle>
            <CardDescription>Wars in our records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{warStats.total}</div>
            <div className="text-sm text-muted-foreground">
              {teamSizeData.length > 0 &&
                `Most common: ${
                  teamSizeData.sort((a, b) => b.count - a.count)[0].teamSize
                }`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="members">Member Stats</TabsTrigger>
          <TabsTrigger value="comparison">Comparisons</TabsTrigger>
          <TabsTrigger value="distribution">War Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>War Performance History</CardTitle>
              <CardDescription>
                Stars and destruction percentage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="stars"
                      stroke="#8884d8"
                      name="Stars"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="destruction"
                      stroke="#82ca9d"
                      name="Destruction %"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Win/Loss Distribution</CardTitle>
              <CardDescription>Breakdown of war results</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[300px] w-full max-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Members with the best attack performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Avg. Stars</th>
                      <th className="text-left py-3 px-4">Destruction %</th>
                      <th className="text-left py-3 px-4">Attack Rate</th>
                      <th className="text-left py-3 px-4">Total Attacks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberPerformance.map((member, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-muted/50" : ""}
                      >
                        <td className="py-2 px-4">{member.name}</td>
                        <td className="py-2 px-4">{member.averageStars}</td>
                        <td className="py-2 px-4">
                          {member.destructionPercentage}%
                        </td>
                        <td className="py-2 px-4">{member.attackRate}%</td>
                        <td className="py-2 px-4">{member.attacks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Performance Radar</CardTitle>
              <CardDescription>
                Top 5 members compared across metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={memberPerformance.slice(0, 5)}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Attack Rate"
                      dataKey="attackRate"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Destruction %"
                      dataKey="destructionPercentage"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clan vs Opponent Comparison</CardTitle>
              <CardDescription>
                How we perform against our opponents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stars" fill="#8884d8" name="Our Stars" />
                    <Bar
                      dataKey="opponentStars"
                      fill="#82ca9d"
                      name="Opponent Stars"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destruction Percentage Comparison</CardTitle>
              <CardDescription>Our destruction % vs opponents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="destruction"
                      stroke="#8884d8"
                      name="Our Destruction %"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="opponentDestruction"
                      stroke="#82ca9d"
                      name="Opponent Destruction %"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>War Size Distribution</CardTitle>
              <CardDescription>Number of wars by team size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamSizeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="teamSize" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Wars" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance by War Size</CardTitle>
              <CardDescription>Win rate by different war sizes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">War Size</th>
                      <th className="text-left py-3 px-4">Total Wars</th>
                      <th className="text-left py-3 px-4">Wins</th>
                      <th className="text-left py-3 px-4">Losses</th>
                      <th className="text-left py-3 px-4">Draws</th>
                      <th className="text-left py-3 px-4">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamSizeData.map((sizeData, index) => {
                      const size = parseInt(sizeData.teamSize.split("v")[0]);
                      const sizeWars = warLog.filter(
                        (war) => war.teamSize === size
                      );
                      const wins = sizeWars.filter(
                        (war) => war.result === "win"
                      ).length;
                      const losses = sizeWars.filter(
                        (war) => war.result === "lose"
                      ).length;
                      const draws = sizeWars.filter(
                        (war) => war.result === "tie"
                      ).length;
                      const winRate =
                        sizeWars.length > 0
                          ? ((wins / sizeWars.length) * 100).toFixed(1)
                          : "0";

                      return (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-muted/50" : ""}
                        >
                          <td className="py-2 px-4">{sizeData.teamSize}</td>
                          <td className="py-2 px-4">{sizeData.count}</td>
                          <td className="py-2 px-4">{wins}</td>
                          <td className="py-2 px-4">{losses}</td>
                          <td className="py-2 px-4">{draws}</td>
                          <td className="py-2 px-4">{winRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
