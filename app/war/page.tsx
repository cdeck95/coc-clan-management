import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WarStatusDashboard from "@/components/war-status-dashboard";
import CWLGroupDisplay from "@/components/cwl-group-display";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, CalendarDays } from "lucide-react";

// Use this environment variable for the clan tag
const CLAN_TAG = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

export default function WarPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clan Wars</h1>
          <p className="text-muted-foreground mt-2">
            View current war status and clan war league information
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/warleague/history">
            <Button
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              <Trophy className="mr-2 h-4 w-4 text-[var(--chart-1)]" />
              CWL History
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="current">Current War</TabsTrigger>
          <TabsTrigger value="cwl">Clan War League</TabsTrigger>
          <TabsTrigger value="history">War History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <WarStatusDashboard />
        </TabsContent>

        <TabsContent value="cwl" className="space-y-4">
          <CWLGroupDisplay clanTag={CLAN_TAG} />
        </TabsContent>

        <TabsContent value="history">
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/30 rounded-md">
            <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
            <p>War history will be implemented in a future update.</p>
            <p className="text-sm mt-2">
              Check out the CWL History tab for past CWL performance.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
