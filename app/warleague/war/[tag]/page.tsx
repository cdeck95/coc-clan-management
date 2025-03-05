import { getWarLeagueWar } from "@/lib/api";
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
import { CalendarIcon, ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function WarLeagueWarPage({
  params,
}: {
  params: { tag: string };
}) {
  // Decode the URL-encoded tag
  const decodedTag = decodeURIComponent(params.tag);
  const warData = await getWarLeagueWar(decodedTag);

  if (!warData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not fetch war data for tag {decodedTag}
          </AlertDescription>
        </Alert>
        <Link
          href="/warleague"
          className="text-primary hover:underline flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to War League
        </Link>
      </div>
    );
  }

  const clanStars = warData.clan.stars;
  const opponentStars = warData.opponent.stars;
  const clanDestruction = warData.clan.destructionPercentage;
  const opponentDestruction = warData.opponent.destructionPercentage;
  const attacksUsed = warData.clan.attacks || 0;
  const totalPossibleAttacks = warData.teamSize * 2;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            War League War Details
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDate(warData.startTime)}
          </p>
        </div>
        <Link
          href="/warleague"
          className="text-primary hover:underline flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to War League
        </Link>
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
          <CardDescription>Current standings in this CWL war</CardDescription>
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

        {/* Our Team Tab Content */}
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
                      {/* In CWL, members only get one attack per war */}
                      {member.attacks?.length || 0}/1
                    </span>
                  </div>

                  {/* Show attack details if available */}
                  {member.attacks?.map((attack, idx) => (
                    <div key={idx} className="bg-muted p-2 rounded-md">
                      <div className="flex justify-between">
                        <span>Attack against #{attack.defenderTag}:</span>
                        <span className="font-medium">
                          {attack.stars} ⭐ (
                          {attack.destructionPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Attack order: {attack.order}
                      </div>
                    </div>
                  ))}

                  {/* Show defense details if any */}
                  {member.opponentAttacks > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Defenses:</span>
                        <span>{member.opponentAttacks}</span>
                      </div>

                      {member.bestOpponentAttack && (
                        <div className="bg-destructive/10 p-2 rounded-md">
                          <div className="flex justify-between">
                            <span>Best attack against:</span>
                            <span className="font-medium">
                              {member.bestOpponentAttack.stars} ⭐ (
                              {member.bestOpponentAttack.destructionPercentage.toFixed(
                                1
                              )}
                              %)
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            By: {member.bestOpponentAttack.attackerTag}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Opponent Tab Content */}
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
                      {/* In CWL, members only get one attack per war */}
                      {member.attacks?.length || 0}/1
                    </span>
                  </div>

                  {/* Show attack details if available */}
                  {member.attacks?.map((attack, idx) => (
                    <div key={idx} className="bg-muted p-2 rounded-md">
                      <div className="flex justify-between">
                        <span>Attack against #{attack.defenderTag}:</span>
                        <span className="font-medium">
                          {attack.stars} ⭐ (
                          {attack.destructionPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Attack order: {attack.order}
                      </div>
                    </div>
                  ))}

                  {/* Show defense details if any */}
                  {member.opponentAttacks > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Defenses:</span>
                        <span>{member.opponentAttacks}</span>
                      </div>

                      {member.bestOpponentAttack && (
                        <div className="bg-green-500/10 p-2 rounded-md">
                          <div className="flex justify-between">
                            <span>Best attack against:</span>
                            <span className="font-medium">
                              {member.bestOpponentAttack.stars} ⭐ (
                              {member.bestOpponentAttack.destructionPercentage.toFixed(
                                1
                              )}
                              %)
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            By: {member.bestOpponentAttack.attackerTag}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* War Notes and Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Clan War League Information</CardTitle>
          <CardDescription>Additional war details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Team Size</h3>
                <p>{warData.teamSize} members per clan</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Attacks Per Member</h3>
                <p>1 attack (CWL format)</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">War Start</h3>
                <p>{formatDate(warData.startTime)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">War End</h3>
                <p>{formatDate(warData.endTime)}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm font-medium">Note:</span>
                <span className="text-sm text-muted-foreground">
                  In Clan War League, each member only gets one attack per war,
                  and there&apos;s no limit on how many times a base can be
                  attacked.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
