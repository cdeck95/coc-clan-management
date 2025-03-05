import { getClanInfo } from "@/lib/api";
import { MemberCard } from "@/components/member-card";
import { ApiStatusBanner } from "@/components/api-status-banner";
import { MOCK_CLAN_DATA } from "@/lib/mock-data";

export default async function MembersPage() {
  const clanData = await getClanInfo();

  // Check if using mock data
  const isUsingMockData =
    JSON.stringify(clanData) === JSON.stringify(MOCK_CLAN_DATA);

  return (
    <div className="space-y-6">
      {isUsingMockData && <ApiStatusBanner isUsingMockData={isUsingMockData} />}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clan Members</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view information about all members in the War Boiz clan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clanData.memberList.map((member) => (
          <MemberCard key={member.tag} member={member} />
        ))}
      </div>
    </div>
  );
}
