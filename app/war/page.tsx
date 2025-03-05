import { getCurrentWar, getClanInfo } from "@/lib/api";
import { formatDate, getWarStateColor } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiStatusBanner } from "@/components/api-status-banner";
import { MOCK_WAR_DATA, MOCK_CLAN_DATA } from "@/lib/mock-data";
import Image from "next/image";

export default async function WarPage() {
  const warData = await getCurrentWar();
  const clanData = await getClanInfo();

  // Check if using mock data
  const isUsingMockData =
    JSON.stringify(clanData) === JSON.stringify(MOCK_CLAN_DATA) ||
    JSON.stringify(warData) === JSON.stringify(MOCK_WAR_DATA);

  // If we're not in a war
  if (warData.state === "notInWar") {
    return (
      <div className="space-y-6">
        {isUsingMockData && (
          <ApiStatusBanner isUsingMockData={isUsingMockData} />
        )}

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Current War</h1>
          <p className="text-muted-foreground mt-2">
            Information about the current clan war
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Not In War</CardTitle>
            <CardDescription>
              The clan is not currently participating in a war
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calculate war stats
  const clanStars = warData.clan.stars;
  const opponentStars = warData.opponent.stars;
  const clanDestruction = warData.clan.destructionPercentage;
  const opponentDestruction = warData.opponent.destructionPercentage;
  const attacksUsed = warData.clan.attacks || 0;
  const totalPossibleAttacks = warData.teamSize * 2;

  return (
    <div className="space-y-6">
      {isUsingMockData && <ApiStatusBanner isUsingMockData={isUsingMockData} />}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Current War</h1>
        <p className="text-muted-foreground mt-2">
          Information about the current clan war
        </p>
      </div>

      {/* War Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>War Status</CardTitle>
            <Badge className={getWarStateColor(warData.state)}>
              {warData.state}
            </Badge>
          </div>
          <CardDescription>
            {warData.state === "preparation" &&
              `War starts ${formatDate(warData.startTime)}`}
            {warData.state === "inWar" &&
              `War ends ${formatDate(warData.endTime)}`}
            {warData.state === "warEnded" &&
              `War ended ${formatDate(warData.endTime)}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* War Score */}
      <Card>
        <CardHeader>
          <CardTitle>War Score</CardTitle>
          <CardDescription>Current standings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                {warData.clan.badgeUrls?.small && (
                  <Image
                    src={warData.clan.badgeUrls.small}
                    alt={warData.clan.name}
                    width={40}
                    height={40}
                  />
                )}
              </div>
              <h3 className="font-medium">{warData.clan.name}</h3>
              <p className="text-xs text-muted-foreground">
                Level {warData.clan.clanLevel}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-bold mb-2">
                {clanStars} - {opponentStars}
              </div>
              <div className="text-xs text-muted-foreground">
                {attacksUsed} / {totalPossibleAttacks} attacks used
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center">
                {warData.opponent.badgeUrls?.small && (
                  <Image
                    src={warData.opponent.badgeUrls.small}
                    alt={warData.opponent.name}
                    width={40}
                    height={40}
                  />
                )}
              </div>
              <h3 className="font-medium">{warData.opponent.name}</h3>
              <p className="text-xs text-muted-foreground">
                Level {warData.opponent.clanLevel}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <span>{warData.clan.name} Destruction</span>
                <span>{clanDestruction.toFixed(1)}%</span>
              </div>
              <Progress value={clanDestruction} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-xs">
                <span>{warData.opponent.name} Destruction</span>
                <span>{opponentDestruction.toFixed(1)}%</span>
              </div>
              <Progress value={opponentDestruction} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* War Details Tabs */}
      <Tabs defaultValue="our-team">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="our-team">Our Team</TabsTrigger>
          <TabsTrigger value="opponent">Opponent</TabsTrigger>
        </TabsList>
        <TabsContent value="our-team" className="space-y-4 mt-4">
          {warData.clan.members.map((member) => (
            <Card key={member.tag}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <Badge>TH{member.townhallLevel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Map Position:</span>
                    <span className="font-medium">#{member.mapPosition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attacks Used:</span>
                    <span className="font-medium">
                      {member.attacks?.length || 0}/2
                    </span>
                  </div>
                  {member.attacks?.map((attack, idx) => (
                    <div key={idx} className="bg-muted p-2 rounded-md">
                      <div className="flex justify-between">
                        <span>Attack #{idx + 1}:</span>
                        <span className="font-medium">
                          {attack.stars} ⭐ (
                          {attack.destructionPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="opponent" className="space-y-4 mt-4">
          {warData.opponent.members.map((member) => (
            <Card key={member.tag}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <Badge>TH{member.townhallLevel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Map Position:</span>
                    <span className="font-medium">#{member.mapPosition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attacks Used:</span>
                    <span className="font-medium">
                      {member.attacks?.length || 0}/2
                    </span>
                  </div>
                  {member.attacks?.map((attack, idx) => (
                    <div key={idx} className="bg-muted p-2 rounded-md">
                      <div className="flex justify-between">
                        <span>Attack #{idx + 1}:</span>
                        <span className="font-medium">
                          {attack.stars} ⭐ (
                          {attack.destructionPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  {member.bestOpponentAttack && (
                    <div className="bg-destructive/10 p-2 rounded-md">
                      <div className="flex justify-between">
                        <span>Defended with:</span>
                        <span className="font-medium">
                          {member.bestOpponentAttack.stars} ⭐ (
                          {member.bestOpponentAttack.destructionPercentage.toFixed(
                            1
                          )}
                          %)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
