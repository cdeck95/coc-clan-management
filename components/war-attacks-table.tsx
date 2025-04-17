import React from "react";
import { ClanWar } from "@/types/clash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarAttacksTableContent } from "./war-attacks-table-content";

interface WarAttacksTableProps {
  warData: ClanWar;
}

export function WarAttacksTable({ warData }: WarAttacksTableProps) {
  const { clan, opponent } = warData;

  // Combine both clan's members
  const allMembers = [
    ...clan.members.map((member) => ({
      ...member,
      isOurClan: true,
      // Ensure attacks are properly typed with order as string
      attacks: member.attacks?.map((attack) => ({
        ...attack,
        // Convert any potential number to string if needed
        order:
          typeof attack.order === "number"
            ? String(attack.order)
            : attack.order,
      })),
    })),
    ...opponent.members.map((member) => ({
      ...member,
      isOurClan: false,
      // Ensure attacks are properly typed with order as string
      attacks: member.attacks?.map((attack) => ({
        ...attack,
        // Convert any potential number to string if needed
        order:
          typeof attack.order === "number"
            ? String(attack.order)
            : attack.order,
      })),
    })),
  ];

  // Sort by position in the war map
  allMembers.sort((a, b) => a.mapPosition - b.mapPosition);

  const clanMembers = clan.members.map((member) => ({
    ...member,
    isOurClan: true,
    // Ensure attacks are properly typed with order as string
    attacks: member.attacks?.map((attack) => ({
      ...attack,
      // Convert any potential number to string if needed
      order:
        typeof attack.order === "number" ? String(attack.order) : attack.order,
    })),
  }));

  const opponentMembers = opponent.members.map((member) => ({
    ...member,
    isOurClan: false,
    // Ensure attacks are properly typed with order as string
    attacks: member.attacks?.map((attack) => ({
      ...attack,
      // Convert any potential number to string if needed
      order:
        typeof attack.order === "number" ? String(attack.order) : attack.order,
    })),
  }));

  // Sort clan members by map position
  clanMembers.sort((a, b) => a.mapPosition - b.mapPosition);

  // Sort opponent members by map position
  opponentMembers.sort((a, b) => a.mapPosition - b.mapPosition);

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
