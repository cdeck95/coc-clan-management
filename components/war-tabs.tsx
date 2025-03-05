"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WarStatusDashboard from "@/components/war-status-dashboard";
import CWLGroupDisplay from "@/components/cwl-group-display";
import { CalendarDays } from "lucide-react";

interface WarTabsProps {
  defaultTab: string;
  clanTag: string;
}

export default function WarTabs({ defaultTab, clanTag }: WarTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="bg-muted/60">
        <TabsTrigger value="current">Current War</TabsTrigger>
        <TabsTrigger value="cwl">Clan War League</TabsTrigger>
        <TabsTrigger value="history">War History</TabsTrigger>
      </TabsList>

      <TabsContent value="current" className="space-y-4">
        <WarStatusDashboard />
      </TabsContent>

      <TabsContent value="cwl" className="space-y-4">
        <CWLGroupDisplay clanTag={clanTag} />
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
  );
}
