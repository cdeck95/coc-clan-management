import { getClanInfo } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MembersList } from "@/components/members-list";

export default async function MembersPage() {
  const clanData = await getClanInfo();
  const members = clanData.memberList || [];

  // Sort members by role priority, then by trophies
  const sortedMembers = [...members].sort((a, b) => {
    // Role priority: leader > co-leader > elder > member
    const roleOrder: { [key: string]: number } = {
      leader: 1,
      "co-leader": 2,
      elder: 3,
      member: 4,
    };

    if (roleOrder[a.role] !== roleOrder[b.role]) {
      return roleOrder[a.role] - roleOrder[b.role];
    }

    // Then sort by trophies
    return b.trophies - a.trophies;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {clanData.name} Members
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage clan members, view stats, and track performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members List</CardTitle>
          <CardDescription>
            {members.length} total members ({members.length}/50)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembersList members={sortedMembers} />
        </CardContent>
      </Card>
    </div>
  );
}
