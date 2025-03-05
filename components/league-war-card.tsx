import { ClanWarLeagueWar } from "@/types/clash";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getWarStateColor, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface LeagueWarCardProps {
  war: ClanWarLeagueWar;
  round: number;
  warTag: string;
}

export function LeagueWarCard({ war, round, warTag }: LeagueWarCardProps) {
  // Handle potentially missing data
  if (!war || !war.clan || !war.opponent) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-accent/30 pb-2">
          <CardTitle>Round {round}</CardTitle>
          <CardDescription>War data unavailable</CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            War information could not be loaded
          </p>
        </CardContent>
      </Card>
    );
  }

  const clanTag = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";
  const ourClan = war.clan.tag === clanTag ? war.clan : war.opponent;
  const theirClan = war.clan.tag === clanTag ? war.opponent : war.clan;

  const ourStars = ourClan.stars || 0;
  const theirStars = theirClan.stars || 0;
  const ourDestruction = ourClan.destructionPercentage || 0;
  const theirDestruction = theirClan.destructionPercentage || 0;

  const isWinning =
    ourStars > theirStars ||
    (ourStars === theirStars && ourDestruction > theirDestruction);

  const isTied = ourStars === theirStars && ourDestruction === theirDestruction;

  const statusColor = isWinning
    ? "text-green-500"
    : isTied
    ? "text-yellow-500"
    : "text-red-500";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-accent/30 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Round {round}</CardTitle>
          <Badge className={getWarStateColor(war.state)}>
            {war.state || "Unknown"}
          </Badge>
        </div>
        <CardDescription>
          {war.state === "preparation" &&
            war.startTime &&
            `War starts ${formatDate(war.startTime)}`}
          {war.state === "inWar" &&
            war.endTime &&
            `War ends ${formatDate(war.endTime)}`}
          {war.state === "warEnded" &&
            war.endTime &&
            `War ended ${formatDate(war.endTime)}`}
          {!war.state && "War status unknown"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-center">
            {ourClan.badgeUrls?.small ? (
              <Image
                src={ourClan.badgeUrls.small}
                alt={ourClan.name}
                width={40}
                height={40}
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                ?
              </div>
            )}
            <span className="text-sm mt-1 font-medium">{ourClan.name}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`text-xl font-bold ${statusColor}`}>
              {ourStars}
            </span>
            <span className="text-xl font-bold mx-1">-</span>
            <span className={`text-xl font-bold ${statusColor}`}>
              {theirStars}
            </span>
          </div>

          <div className="flex flex-col items-center">
            {theirClan.badgeUrls?.small ? (
              <Image
                src={theirClan.badgeUrls.small}
                alt={theirClan.name}
                width={40}
                height={40}
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                ?
              </div>
            )}
            <span className="text-sm mt-1 font-medium">{theirClan.name}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span>{ourClan.name}</span>
              <span>{ourDestruction.toFixed(1)}%</span>
            </div>
            <Progress value={ourDestruction} className="h-1.5" />
          </div>

          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span>{theirClan.name}</span>
              <span>{theirDestruction.toFixed(1)}%</span>
            </div>
            <Progress value={theirDestruction} className="h-1.5" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-card/50 pt-2">
        <Link
          href={`/warleague/war/${encodeURIComponent(warTag)}`}
          className="w-full"
        >
          <Button variant="outline" className="w-full" size="sm">
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
