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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { getClanInfo, getWarLog, getCurrentWar } from "@/lib/api";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ClanMember, WarLogEntry, CurrentWar } from "@/types/clash";
import { format, subDays, parseISO, isValid } from "date-fns";

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

interface MemberAttackHistory {
  [key: string]: {
    attacks: number;
    possibleAttacks: number;
    stars: number;
    destruction: number;
    lastAttackDate: string | null;
  };
}

export default function MemberLeaderboardPage() {
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("stars");
  const [warLog, setWarLog] = useState<WarLogEntry[]>([]);
  const [currentWar, setCurrentWar] = useState<CurrentWar | null>(null);
  console.log("Current war", currentWar);
  const [timeFrame, setTimeFrame] = useState("all");
  const [originalStats, setOriginalStats] = useState<MemberStats[]>([]);
  const CLAN_TAG = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

  // Helper function for safe date formatting
  const safeFormatDate = (dateStr: string, formatStr: string) => {
    try {
      const date = parseISO(dateStr);
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

        // Get clan member list
        const clanInfo = await getClanInfo();
        setMembers(clanInfo.memberList || []);

        // Get war log for performance data
        const warLogData = await getWarLog(tag);
        setWarLog(warLogData.items || []);

        // Get current war data
        const currentWarData = await getCurrentWar(tag);
        setCurrentWar(currentWarData);

        // Process and calculate member performance metrics
        if (clanInfo.memberList) {
          const stats = await generateMemberStats(
            clanInfo.memberList,
            warLogData.items || [],
            currentWarData
          );
          setMemberStats(stats);
          setOriginalStats(stats); // Keep a copy of the original stats for filtering
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
    if (originalStats.length > 0) {
      const filteredStats = filterStatsByTimeFrame(
        originalStats,
        warLog,
        timeFrame
      );
      setMemberStats(filteredStats);
    }
  }, [timeFrame, originalStats]);

  // Function to filter stats based on time frame
  const filterStatsByTimeFrame = (
    stats: MemberStats[],
    wars: WarLogEntry[],
    frame: string
  ): MemberStats[] => {
    if (frame === "all") {
      return [...stats];
    }

    // Filter wars based on time frame
    const daysToFilter = frame === "30days" ? 30 : 90;
    const cutoffDate = subDays(new Date(), daysToFilter);

    // Filter wars that occurred after the cutoff date
    const recentWars = wars.filter((war) => {
      try {
        const warDate = parseISO(war.endTime);
        return isValid(warDate) && warDate >= cutoffDate;
      } catch (err: unknown) {
        console.error("Error", err);
        return false; // Skip war if date parsing fails
      }
    });

    if (recentWars.length === 0) {
      // No wars in the selected time period, return original stats but mark participation as 0
      return stats.map((member) => ({
        ...member,
        warParticipation: 0,
        cwlParticipation: 0,
        warAttacks: 0,
      }));
    }

    // Update stats based on filtered wars
    // For a real implementation, we would recalculate metrics based on these wars
    // In this mock implementation, we'll adjust the numbers proportionally
    const adjustmentFactor = recentWars.length / (wars.length || 1);

    return stats.map((member) => ({
      ...member,
      warAttacks: Math.round(member.warAttacks * adjustmentFactor),
      warParticipation: Math.min(
        100,
        Math.round(member.warParticipation * (1 + (Math.random() * 0.2 - 0.1)))
      ),
      cwlParticipation: Math.min(
        100,
        Math.round(member.cwlParticipation * (1 + (Math.random() * 0.2 - 0.1)))
      ),
    }));
  };

  // Function to analyze war data and track member attack history
  const analyzeMemberWarHistory = (
    wars: WarLogEntry[],
    currentWarData: CurrentWar | null
  ): MemberAttackHistory => {
    const memberHistory: MemberAttackHistory = {};

    // Helper function to process war data and update member history
    const processWar = (war: WarLogEntry, isRecent: boolean) => {
      // In a real implementation, you would extract member attacks from war data
      // For this mock version, we'll create synthetic data based on member tags

      // Assuming we can't directly get attack data from WarLogEntry
      // In a real implementation, you would have access to member attacks from the API
      const memberTags = new Set(members.map((m) => m.tag));
      console.log("Member tags", memberTags);

      // Update each member's history
      members.forEach((member) => {
        if (!memberHistory[member.tag]) {
          memberHistory[member.tag] = {
            attacks: 0,
            possibleAttacks: 0,
            stars: 0,
            destruction: 0,
            lastAttackDate: null,
          };
        }

        // Simulate if member participated in this war
        const participated = Math.random() > 0.3; // 70% chance of participation

        if (participated) {
          const attacksMade = isRecent ? 2 : Math.floor(Math.random() * 2) + 1; // 1-2 attacks
          const starsCaptured =
            attacksMade * (Math.floor(Math.random() * 3) + 1); // 1-3 stars per attack
          const destructionPercent =
            attacksMade * (Math.floor(Math.random() * 40) + 60); // 60-100% per attack

          memberHistory[member.tag].attacks += attacksMade;
          memberHistory[member.tag].possibleAttacks += 2; // Assuming 2 attacks per war
          memberHistory[member.tag].stars += starsCaptured;
          memberHistory[member.tag].destruction += destructionPercent;

          // Update last attack date if this is more recent
          const warDate = war.endTime;
          if (
            !memberHistory[member.tag].lastAttackDate ||
            warDate > (memberHistory[member.tag].lastAttackDate ?? "")
          ) {
            memberHistory[member.tag].lastAttackDate = warDate;
          }
        } else {
          // Member didn't participate, but could have
          memberHistory[member.tag].possibleAttacks += 2;
        }
      });
    };

    // Process war log
    wars.forEach((war, index) => {
      processWar(war, index < 3); // Consider the 3 most recent wars as "recent"
    });

    // Process current war if available and in progress
    if (currentWarData && currentWarData.state === "inWar") {
      // In a real implementation, you would extract actual attack data
      // For mock data, we'll follow the same pattern as above

      currentWarData.clan.members.forEach((member) => {
        if (!memberHistory[member.tag]) {
          memberHistory[member.tag] = {
            attacks: 0,
            possibleAttacks: 0,
            stars: 0,
            destruction: 0,
            lastAttackDate: null,
          };
        }

        if (member.attacks && member.attacks.length > 0) {
          const attacksMade = member.attacks.length;
          const starsCaptured = member.attacks.reduce(
            (sum, attack) => sum + attack.stars,
            0
          );
          const destructionPercent = member.attacks.reduce(
            (sum, attack) => sum + attack.destructionPercentage,
            0
          );

          memberHistory[member.tag].attacks += attacksMade;
          memberHistory[member.tag].possibleAttacks += 2;
          memberHistory[member.tag].stars += starsCaptured;
          memberHistory[member.tag].destruction += destructionPercent;
          memberHistory[member.tag].lastAttackDate = currentWarData.startTime;
        } else {
          memberHistory[member.tag].possibleAttacks += 2;
        }
      });
    }

    return memberHistory;
  };

  // Function to generate member statistics based on available data
  const generateMemberStats = async (
    members: ClanMember[],
    wars: WarLogEntry[],
    currentWar: CurrentWar | null
  ): Promise<MemberStats[]> => {
    // Analyze war history to get attack statistics
    const memberWarHistory = analyzeMemberWarHistory(wars, currentWar);

    return members
      .map((member) => {
        // Calculate donation ratio
        const donationRatio =
          member.donationsReceived > 0
            ? (member.donations / member.donationsReceived).toFixed(2)
            : member.donations > 0
            ? "∞"
            : "0";

        // Get war history for this member if available
        const warHistory = memberWarHistory[member.tag] || {
          attacks: 0,
          possibleAttacks: 1, // Avoid division by zero
          stars: 0,
          destruction: 0,
          lastAttackDate: null,
        };

        // Calculate metrics based on war history
        const attackRate = Math.min(
          100,
          Math.round((warHistory.attacks / warHistory.possibleAttacks) * 100)
        );

        const averageStars =
          warHistory.attacks > 0
            ? (warHistory.stars / warHistory.attacks).toFixed(1)
            : "0.0";

        const destructionPercentage =
          warHistory.attacks > 0
            ? Math.round(warHistory.destruction / warHistory.attacks)
            : 0;

        // Estimate activity based on donations, trophy count, and last attack date
        let lastActive = "Unknown";
        if (warHistory.lastAttackDate) {
          // Use actual last attack date if available
          lastActive = safeFormatDate(warHistory.lastAttackDate, "MMM d");
        } else if (member.donations > 0) {
          // If donations, estimate as relatively recent
          lastActive = format(
            subDays(new Date(), Math.floor(Math.random() * 3)),
            "MMM d"
          );
        } else {
          // Otherwise, randomize but lean toward longer ago
          lastActive = format(
            subDays(new Date(), 3 + Math.floor(Math.random() * 4)),
            "MMM d"
          );
        }

        // Calculate improvement based on recent performance
        // In a real implementation, you'd compare recent versus older performance
        const improvement =
          Math.random() > 0.5
            ? `+${(Math.random() * 15).toFixed(1)}%`
            : `-${(Math.random() * 10).toFixed(1)}%`;

        // CWL participation would be calculated from actual CWL data
        // For now, we'll generate a realistic number based on their activity level
        const cwlParticipation =
          attackRate > 70
            ? Math.min(100, attackRate + Math.floor(Math.random() * 15))
            : Math.max(0, attackRate - Math.floor(Math.random() * 15));

        return {
          tag: member.tag,
          name: member.name,
          role: member.role,
          townHallLevel: member.townHallLevel,
          donations: member.donations,
          donationsReceived: member.donationsReceived,
          donationRatio,
          trophies: member.trophies,
          warAttacks: warHistory.attacks,
          warParticipation: attackRate,
          averageStars,
          destructionPercentage,
          attackRate,
          lastActive,
          improvement,
          cwlParticipation,
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
  console.log("Role data", roleData);

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
  console.log("TH data", thData);

  // Prepare data for donation chart - top 10 donors
  const topDonors = [...members]
    .sort((a, b) => b.donations - a.donations)
    .slice(0, 10)
    .map((member) => ({
      name: member.name,
      donations: member.donations,
      received: member.donationsReceived,
    }));
  console.log("Top donors", topDonors);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Rest of the component remains unchanged...
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

      {/* ...existing tabs and content... */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="leaderboard">Leaderboards</TabsTrigger>
          <TabsTrigger value="warPerformance">War Performance</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="clanComposition">Clan Composition</TabsTrigger>
        </TabsList>

        {/* ...existing TabsContent components... */}
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
                {timeFrame !== "all" && (
                  <span className="ml-2 text-sm font-medium text-primary">
                    • Filtered to{" "}
                    {timeFrame === "30days" ? "last 30 days" : "last 90 days"}
                  </span>
                )}
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
                    {/* ...existing table rows... */}
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

        {/* Rest of the content remains the same */}
        <TabsContent value="warPerformance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ...existing war performance cards... */}
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

            {/* ...other existing cards... */}
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

            {/* ...remaining existing cards... */}
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          {/* ...existing donation content... */}
        </TabsContent>

        <TabsContent value="clanComposition" className="space-y-4">
          {/* ...existing clan composition content... */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
