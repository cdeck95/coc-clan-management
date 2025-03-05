import { getClanInfo } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiStatusBanner } from "@/components/api-status-banner";
import { Shield, Users, Trophy, Swords } from "lucide-react";
import Image from "next/image";
import { MOCK_CLAN_DATA } from "@/lib/mock-data";

export default async function Dashboard() {
  const clanData = await getClanInfo();

  // Check if using mock data
  const isUsingMockData =
    JSON.stringify(clanData) === JSON.stringify(MOCK_CLAN_DATA);

  // Calculate win rate safely
  const winRate =
    clanData.warWins + clanData.warLosses > 0
      ? Math.round(
          (clanData.warWins / (clanData.warWins + clanData.warLosses)) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {isUsingMockData && <ApiStatusBanner isUsingMockData={isUsingMockData} />}

      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        {clanData?.badgeUrls?.medium && (
          <div className="flex-shrink-0">
            <Image
              src={clanData.badgeUrls.medium}
              alt={`${clanData.name} clan badge`}
              width={128}
              height={128}
              className="rounded-lg"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{clanData.name}</h1>
          <p className="text-muted-foreground">{clanData.tag}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-blue-500">
              Level {clanData.clanLevel}
            </Badge>
            <Badge variant="outline" className="text-green-500">
              {clanData.members} Members
            </Badge>
            {clanData.warLeague?.name && (
              <Badge variant="outline" className="text-yellow-500">
                {clanData.warLeague.name}
              </Badge>
            )}
          </div>
          <p className="mt-4">{clanData.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clanData.members}/50</div>
            <p className="text-xs text-muted-foreground mt-1">
              {50 - clanData.members} spots available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">War Record</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clanData.warWins}/{clanData.warWins + clanData.warLosses}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Win Rate: {winRate}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Clan Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clanData.clanPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Versus Points: {clanData.clanVersusPoints}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">War League</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clanData.warLeague?.name || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Frequency: {clanData.warFrequency}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Clan Requirements</CardTitle>
            <CardDescription>Minimum requirements to join</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Required Trophies:</span>
              <span className="font-medium">{clanData.requiredTrophies}</span>
            </div>
            {clanData.requiredTownhallLevel && (
              <div className="flex justify-between">
                <span>Required Town Hall Level:</span>
                <span className="font-medium">
                  {clanData.requiredTownhallLevel}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Clan Location</CardTitle>
            <CardDescription>Where the clan is based</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {clanData.location && (
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-medium">{clanData.location.name}</span>
              </div>
            )}
            {clanData.chatLanguage && (
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-medium">
                  {clanData.chatLanguage.name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
