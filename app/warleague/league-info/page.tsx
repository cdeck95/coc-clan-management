import { listWarLeagues, getWarLeagueInfo } from "@/lib/api";
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
import { Trophy, Medal } from "lucide-react";
import Link from "next/link";
import { WarLeague } from "@/types/clash";

export default async function WarLeagueInfoPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  // Await searchParams to fix the error
  const params = await searchParams;
  // Fetch all war leagues if no specific ID is provided
  const leagueId = params.id ? parseInt(params.id) : null;
  let warLeagues: WarLeague[] = [];
  let selectedLeague: WarLeague | null = null;

  try {
    warLeagues = await listWarLeagues();

    // If a league ID is provided, fetch details for that league
    if (leagueId) {
      selectedLeague = await getWarLeagueInfo(leagueId);
    }
  } catch (error) {
    console.error("Error fetching war league data:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          War League Information
        </h1>
        <p className="text-muted-foreground mt-2">
          View details about Clash of Clans war leagues
        </p>
      </div>

      {selectedLeague ? (
        <Card>
          <CardHeader className="flex flex-row items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
            <div>
              <CardTitle>{selectedLeague.name}</CardTitle>
              <CardDescription>War League Details</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">
                  League ID: {selectedLeague.id}
                </h3>
                <p className="text-muted-foreground">
                  This league&apos;s unique identifier in the Clash of Clans
                  API.
                </p>
              </div>

              {/* Additional league info would go here if the API provides more details */}

              <div className="mt-4">
                <Link
                  href="/warleague/league-info"
                  className="text-primary hover:underline"
                >
                  ← Back to all War Leagues
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Available War Leagues</CardTitle>
            <CardDescription>All war leagues in Clash of Clans</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warLeagues.map((league) => (
                  <TableRow key={league.id}>
                    <TableCell className="font-mono">{league.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Medal className="h-4 w-4 mr-2 text-yellow-500" />
                        {league.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/warleague/league-info?id=${league.id}`}
                        className="text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
