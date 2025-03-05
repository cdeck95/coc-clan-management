import { getCurrentWarLeague, getWarLeagueWar } from "@/lib/api";
import { ApiStatusBanner } from "@/components/api-status-banner";
import { MOCK_CWL_GROUP_DATA, MOCK_WAR_DATA } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { LeagueWarCard } from "@/components/league-war-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Medal, AlertCircle } from "lucide-react";
import { ClanWarLeagueWar, ClanWarLeagueGroup } from "@/types/clash";

export default async function WarLeaguePage() {
  let leagueData: ClanWarLeagueGroup;
  let isUsingMockData = false;

  try {
    leagueData = await getCurrentWarLeague();

    // Check if using mock data
    isUsingMockData =
      JSON.stringify(leagueData) === JSON.stringify(MOCK_CWL_GROUP_DATA);
  } catch (error) {
    console.error("Error fetching war league data:", error);
    leagueData = MOCK_CWL_GROUP_DATA;
    isUsingMockData = true;
  }

  // Ensure clans and rounds exist with fallbacks
  const clans = leagueData?.clans || [];
  const rounds = leagueData?.rounds || [];
  const season = leagueData?.season || new Date().toISOString().substring(0, 7);

  // Get wars data for the first round as an example - with proper error handling
  let roundOneWars: ClanWarLeagueWar[] = [];
  if (rounds.length > 0 && rounds[0]?.warTags?.length > 0) {
    try {
      roundOneWars = await Promise.all(
        rounds[0].warTags.map(async (tag) => {
          try {
            return await getWarLeagueWar(tag);
          } catch (error) {
            console.error(`Error fetching war with tag ${tag}:`, error);
            // Fix: Use proper mock war data instead of incorrectly casting
            return MOCK_WAR_DATA as ClanWarLeagueWar;
          }
        })
      );
    } catch (error) {
      console.error("Error fetching wars data:", error);
    }
  }

  // Check if clan is not in a war league season
  const notInWarLeague = !rounds.length || rounds.length === 0;

  return (
    <div className="space-y-6">
      {isUsingMockData && <ApiStatusBanner isUsingMockData={isUsingMockData} />}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clan War League</h1>
        <p className="text-muted-foreground mt-2 flex items-center">
          <Calendar className="mr-1 h-4 w-4" />
          Season: {season}
        </p>
      </div>

      {notInWarLeague ? (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Not In War League</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The clan is not currently participating in a Clan War League
              season.
            </p>
            <p className="mt-2 text-muted-foreground text-sm">
              Clan War League runs for one week at the beginning of each month.
              Check back when a new CWL season begins.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>League Group</CardTitle>
              <CardDescription>All clans in this CWL group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {clans.map((clan) => (
                  <div
                    key={clan.tag}
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      clan.tag === process.env.NEXT_PUBLIC_CLAN_TAG
                        ? "bg-accent/30 border-primary"
                        : "border-border"
                    }`}
                  >
                    {clan.badgeUrls?.medium && (
                      <Image
                        src={clan.badgeUrls.medium}
                        alt={clan.name}
                        width={64}
                        height={64}
                        className="mb-2"
                      />
                    )}
                    <span className="font-medium text-center">{clan.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Level {clan.clanLevel}
                    </span>
                    {clan.tag === process.env.NEXT_PUBLIC_CLAN_TAG && (
                      <div className="mt-1 flex items-center text-xs font-semibold text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
                        <Medal className="h-3 w-3 mr-1" />
                        Our Clan
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="round1">
            <TabsList className="overflow-auto flex w-full">
              {rounds.map((_, index) => (
                <TabsTrigger
                  key={index}
                  value={`round${index + 1}`}
                  className="flex-1"
                >
                  Round {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="round1" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roundOneWars.length > 0 ? (
                  roundOneWars.map((war, index) => (
                    <LeagueWarCard
                      key={index}
                      war={war}
                      round={1}
                      warTag={rounds[0].warTags[index] || `#WAR${index}`}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex justify-center items-center p-12">
                    <p className="text-muted-foreground">
                      No war data available for this round yet.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {rounds.slice(1).map((_, index) => (
              <TabsContent
                key={index}
                value={`round${index + 2}`}
                className="mt-4"
              >
                <div className="flex justify-center items-center p-12">
                  <p className="text-muted-foreground">
                    War data will load when this tab is selected
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}
