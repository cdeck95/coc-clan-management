"use client";
import { WarHistory } from "@/components/war-history";

export default function WarHistoryPage() {
  const clanTag = process.env.NEXT_PUBLIC_CLAN_TAG || "#GCVL29VJ";

  return <WarHistory clanTag={clanTag} />;
}
