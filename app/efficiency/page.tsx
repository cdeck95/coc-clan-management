import {
  getMemberEfficiencies,
  updateEfficiencyFromWar,
  getCurrentWar,
} from "@/lib/api";
import { EfficiencyCard } from "@/components/efficiency-card";
import { ApiStatusBanner } from "@/components/api-status-banner";
import { MOCK_WAR_DATA } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default async function EfficiencyPage() {
  // Get the war data first to potentially update efficiency stats
  const warData = await getCurrentWar();

  // Get efficiency data for all members
  const efficiencies = await getMemberEfficiencies();

  // Sort efficiencies by average stars (descending)
  const sortedEfficiencies = [...efficiencies].sort(
    (a, b) => b.averageStars - a.averageStars
  );

  // Check if using mock data
  const isUsingMockData =
    JSON.stringify(warData) === JSON.stringify(MOCK_WAR_DATA);

  return (
    <div className="space-y-6">
      {isUsingMockData && <ApiStatusBanner isUsingMockData={isUsingMockData} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attack Efficiency
          </h1>
          <p className="text-muted-foreground mt-2">
            View statistics on member attacking performance
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await updateEfficiencyFromWar(warData);
          }}
        >
          <Button type="submit">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Stats
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEfficiencies.length > 0 ? (
          sortedEfficiencies.map((efficiency, index) => (
            <EfficiencyCard
              key={efficiency.memberId}
              efficiency={efficiency}
              rank={index + 1}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No attack efficiency data available yet. Click &quot;Refresh
              Stats&quot; to analyze war data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
