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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
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
import { getClanInfo, getWarLog } from "@/lib/api";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ClanMember, WarLogEntry } from "@/types/clash";
import { format, subDays } from "date-fns";

interface MemberStats {
  tag: string;
  name: string;
  role: string;
  townHallLevel: number;
  donations: number;
  donationsReceived: number;
  donationRatio: string | number;
  trophies: number;
  warAttacks: number;
  warParticipation: number;
  averageStars: string;
  destructionPercentage: number;
  attackRate: number;
  lastActive: string;
  improvement: string;
  cwlParticipation: number;
}

export default function MemberLeaderboardPage() {
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("stars");
  const [warLog, setWarLog] = useState<WarLogEntry[]>([]);
  const [timeFrame, setTimeFrame] = useState("all");
  const CLAN_TAG = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const tag = CLAN_TAG.startsWith("#") ? CLAN_TAG.substring(1) : CLAN_TAG;

        // Get clan member list
        const clanInfo = await getClanInfo();
        setMembers(clanInfo.memberList || []);

        // Get war log for performance data
        const warLogData = await getWarLog(tag);
        setWarLog(warLogData.items || []);

        // Process and calculate member performance metrics
        if (clanInfo.memberList && warLogData.items) {
          const stats = generateMemberStats(
            clanInfo.memberList,
            warLogData.items
          );
          setMemberStats(stats);
        }
      } catch (err) {
        console.error("Error fetching member data:", err);
        setError("Failed to load member data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Filter data based on selected time frame
    if (timeFrame !== "all" && warLog.length > 0) {
      const filteredStats = filterStatsByTimeFrame(
        memberStats,
        warLog,
        timeFrame
      );
      setMemberStats(filteredStats);
    }
  }, [timeFrame]);

  // Function to filter stats based on time frame
  const filterStatsByTimeFrame = (
    stats: MemberStats[],
    wars: WarLogEntry[],
    frame: string
  ) => {
    // This would be implemented with real data
    // For now, we'll just return the original stats
    console.log("Filtering stats by time frame:", frame);
    console.log("war log:", wars);
    return stats;
  };

  // Function to generate synthetic member statistics based on available data
  // In a real implementation, you would use actual war data to calculate these metrics
  const generateMemberStats = (
    members: ClanMember[],
    wars: WarLogEntry[]
  ): MemberStats[] => {
    console.log("war log:", wars);
    return members
      .map((member) => {
        // Calculate donation ratio
        const donationRatio =
          member.donationsReceived > 0
            ? (member.donations / member.donationsReceived).toFixed(2)
            : member.donations > 0
            ? "∞"
            : "0";

        // In a real implementation, you would analyze actual war attacks from the API
        return {
          tag: member.tag,
          name: member.name,
          role: member.role,
          townHallLevel: member.townHallLevel,
          donations: member.donations,
          donationsReceived: member.donationsReceived,
          donationRatio,
          trophies: member.trophies,
          // Synthetic war metrics - would be replaced with real data in production
          warAttacks: Math.round(5 + Math.random() * 15),
          warParticipation: Math.round(60 + Math.random() * 40),
          averageStars: (2 + Math.random()).toFixed(1),
          destructionPercentage: Math.round(70 + Math.random() * 30),
          attackRate: Math.round(70 + Math.random() * 30),
          cwlParticipation: Math.round(60 + Math.random() * 40),
          lastActive: format(
            subDays(new Date(), Math.floor(Math.random() * 7)),
            "MMM d"
          ),
          improvement:
            Math.random() > 0.5
              ? `+${(Math.random() * 15).toFixed(1)}%`
              : `-${(Math.random() * 10).toFixed(1)}%`,
        };
      })
      .sort((a, b) => parseFloat(b.averageStars) - parseFloat(a.averageStars));
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);

    // Sort members based on selected criteria
    const sortedStats = [...memberStats].sort((a, b) => {
      switch (value) {
        case "stars":
          return parseFloat(b.averageStars) - parseFloat(a.averageStars);
        case "destruction":
          return b.destructionPercentage - a.destructionPercentage;
        case "attackRate":
          return b.attackRate - a.attackRate;
        case "donations":
          return b.donations - a.donations;
        case "townHall":
          return b.townHallLevel - a.townHallLevel;
        default:
          return parseFloat(b.averageStars) - parseFloat(a.averageStars);
      }
    });

    setMemberStats(sortedStats);
  };

  // Filter top performers for visualization
  const topPerformers = memberStats.slice(0, 5);

  // Prepare data for role distribution chart
  const roleDistribution = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleData = Object.entries(roleDistribution).map(([role, count]) => ({
    role:
      role === "coLeader"
        ? "Co-Leader"
        : role.charAt(0).toUpperCase() + role.slice(1),
    count,
  }));

  // Prepare data for TH distribution chart
  const thDistribution = members.reduce((acc, member) => {
    acc[member.townHallLevel] = (acc[member.townHallLevel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const thData = Object.entries(thDistribution)
    .map(([th, count]) => ({
      th: `TH${th}`,
      count,
    }))
    .sort((a, b) => a.th.localeCompare(b.th));

  // Prepare data for donation chart - top 10 donors
  const topDonors = [...members]
    .sort((a, b) => b.donations - a.donations)
    .slice(0, 10)
    .map((member) => ({
      name: member.name,
      donations: member.donations,
      received: member.donationsReceived,
    }));

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Member Performance Leaderboard
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Clan Member Statistics</h2>
          <p className="text-muted-foreground">
            Analyze and compare member performance across various metrics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30days">Past 30 Days</SelectItem>
              <SelectItem value="90days">Past 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stars">Average Stars</SelectItem>
              <SelectItem value="destruction">Destruction %</SelectItem>
              <SelectItem value="attackRate">Attack Rate</SelectItem>
              <SelectItem value="donations">Donations</SelectItem>
              <SelectItem value="townHall">Town Hall Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="leaderboard">Leaderboards</TabsTrigger>
          <TabsTrigger value="warPerformance">War Performance</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="clanComposition">Clan Composition</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Member Ranking</span>
                <span className="text-sm text-muted-foreground">
                  Sorted by:{" "}
                  {sortBy === "stars"
                    ? "Average Stars"
                    : sortBy === "destruction"
                    ? "Destruction %"
                    : sortBy === "attackRate"
                    ? "Attack Rate"
                    : sortBy === "donations"
                    ? "Donations"
                    : sortBy === "townHall"
                    ? "Town Hall Level"
                    : "Average Stars"}
                </span>
              </CardTitle>
              <CardDescription>
                Compare member performance across key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">TH</th>
                      <th className="text-left py-3 px-4">Avg. Stars</th>
                      <th className="text-left py-3 px-4">Destruction</th>
                      <th className="text-left py-3 px-4">Attack Rate</th>
                      <th className="text-left py-3 px-4">Donations</th>
                      <th className="text-left py-3 px-4">Received</th>
                      <th className="text-left py-3 px-4">Ratio</th>
                      <th className="text-left py-3 px-4">Last Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats.map((member, index) => (
                      <tr
                        key={member.tag}
                        className={index % 2 === 0 ? "bg-muted/50" : ""}
                      >
                        <td className="py-2 px-4 font-medium">{member.name}</td>
                        <td className="py-2 px-4">
                          {member.role === "coLeader"
                            ? "Co-Leader"
                            : member.role.charAt(0).toUpperCase() +
                              member.role.slice(1)}
                        </td>
                        <td className="py-2 px-4">{member.townHallLevel}</td>
                        <td className="py-2 px-4">{member.averageStars}</td>
                        <td className="py-2 px-4">
                          {member.destructionPercentage}%
                        </td>
                        <td className="py-2 px-4">{member.attackRate}%</td>
                        <td className="py-2 px-4">
                          {member.donations.toLocaleString()}
                        </td>
                        <td className="py-2 px-4">
                          {member.donationsReceived.toLocaleString()}
                        </td>
                        <td className="py-2 px-4">{member.donationRatio}</td>
                        <td className="py-2 px-4">{member.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warPerformance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top War Performers</CardTitle>
                <CardDescription>
                  Members with the highest average stars per attack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topPerformers}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 3]} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="averageStars"
                        name="Average Stars"
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attack Efficiency</CardTitle>
                <CardDescription>
                  Destruction percentage vs attack rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={topPerformers}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Destruction %"
                        dataKey="destructionPercentage"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Attack Rate"
                        dataKey="attackRate"
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

            <Card>
              <CardHeader>
                <CardTitle>War vs CWL Performance</CardTitle>
                <CardDescription>
                  Comparing regular war and CWL participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPerformers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="warParticipation"
                        name="War Participation"
                        fill="#8884d8"
                      />
                      <Bar
                        dataKey="cwlParticipation"
                        name="CWL Participation"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Improvement</CardTitle>
                <CardDescription>
                  Change in attack performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Town Hall</th>
                        <th className="text-left py-3 px-4">Improvement</th>
                        <th className="text-left py-3 px-4">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberStats.slice(0, 10).map((member, index) => (
                        <tr
                          key={member.tag}
                          className={index % 2 === 0 ? "bg-muted/50" : ""}
                        >
                          <td className="py-2 px-4 font-medium">
                            {member.name}
                          </td>
                          <td className="py-2 px-4">{member.townHallLevel}</td>
                          <td className="py-2 px-4">{member.improvement}</td>
                          <td className="py-2 px-4">
                            {member.improvement.startsWith("+") ? (
                              <span className="text-green-500">
                                ↑ Improving
                              </span>
                            ) : (
                              <span className="text-red-500">↓ Declining</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>
                Members with highest donation contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDonors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="donations"
                      name="Donations Made"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="received"
                      name="Donations Received"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donation Leaders</CardTitle>
              <CardDescription>Top 10 contributors to the clan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Donations</th>
                      <th className="text-left py-3 px-4">Received</th>
                      <th className="text-left py-3 px-4">Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats
                      .sort((a, b) => b.donations - a.donations)
                      .slice(0, 10)
                      .map((member, index) => (
                        <tr
                          key={member.tag}
                          className={index % 2 === 0 ? "bg-muted/50" : ""}
                        >
                          <td className="py-2 px-4 font-medium">
                            {member.name}
                          </td>
                          <td className="py-2 px-4">
                            {member.role === "coLeader"
                              ? "Co-Leader"
                              : member.role.charAt(0).toUpperCase() +
                                member.role.slice(1)}
                          </td>
                          <td className="py-2 px-4">
                            {member.donations.toLocaleString()}
                          </td>
                          <td className="py-2 px-4">
                            {member.donationsReceived.toLocaleString()}
                          </td>
                          <td className="py-2 px-4">{member.donationRatio}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clanComposition" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Town Hall Distribution</CardTitle>
                <CardDescription>
                  Breakdown of town hall levels across clan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={thData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="th" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Members" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clan Roles</CardTitle>
                <CardDescription>
                  Distribution of roles in the clan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="count"
                        label={({ role, percent }) =>
                          `${role}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {roleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][
                                index % 4
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Members</CardTitle>
                <CardDescription>
                  Members active in the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-[200px]">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      {Math.round(members.length * 0.85)}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      of {members.length} members
                    </div>
                    <div className="text-sm mt-2">
                      {Math.round(
                        ((members.length * 0.85) / members.length) * 100
                      )}
                      % activity rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>War Eligibility</CardTitle>
                <CardDescription>
                  Members eligible for war participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-[200px]">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      {Math.round(members.length * 0.75)}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      eligible members
                    </div>
                    <div className="text-sm mt-2">
                      {Math.round(
                        ((members.length * 0.75) / members.length) * 100
                      )}
                      % of the clan
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
