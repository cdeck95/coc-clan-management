import React from "react";
import { ClanWar } from "@/types/clash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarAttacksTableContent } from "./war-attacks-table-content";

interface WarAttacksTableProps {
  warData: ClanWar;
}

export function WarAttacksTable({ warData }: WarAttacksTableProps) {
  const { clan, opponent } = warData;

  // Memoize the processed member arrays to avoid recalculating on every render
  const { allMembers, clanMembers, opponentMembers } = React.useMemo(() => {
    // Process clan members
    const processedClanMembers = clan.members.map((member) => ({
      ...member,
      isOurClan: true,
      attacks: member.attacks?.map((attack) => ({
        ...attack,
        order:
          typeof attack.order === "number"
            ? String(attack.order)
            : attack.order,
      })),
    }));

    // Process opponent members
    const processedOpponentMembers = opponent.members.map((member) => ({
      ...member,
      isOurClan: false,
      attacks: member.attacks?.map((attack) => ({
        ...attack,
        order:
          typeof attack.order === "number"
            ? String(attack.order)
            : attack.order,
      })),
    }));

    // Combine and sort all members
    const processedAllMembers = [
      ...processedClanMembers,
      ...processedOpponentMembers,
    ].sort((a, b) => a.mapPosition - b.mapPosition);

    // Sort clan and opponent members
    processedClanMembers.sort((a, b) => a.mapPosition - b.mapPosition);
    processedOpponentMembers.sort((a, b) => a.mapPosition - b.mapPosition);

    return {
      allMembers: processedAllMembers,
      clanMembers: processedClanMembers,
      opponentMembers: processedOpponentMembers,
    };
  }, [clan.members, opponent.members]);

  return (
    <div className="overflow-x-auto">
      <Tabs defaultValue="clan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clan">{clan.name}</TabsTrigger>
          <TabsTrigger value="opponent">{opponent.name}</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <WarAttacksTableContent
            members={allMembers}
            allMembers={allMembers}
            warEndTime={warData.endTime}
            warStatus={warData.state}
          />
        </TabsContent>

        <TabsContent value="clan">
          <WarAttacksTableContent
            members={clanMembers}
            allMembers={allMembers}
            warEndTime={warData.endTime}
            warStatus={warData.state}
          />
        </TabsContent>

        <TabsContent value="opponent">
          <WarAttacksTableContent
            members={opponentMembers}
            allMembers={allMembers}
            warEndTime={warData.endTime}
            warStatus={warData.state}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
