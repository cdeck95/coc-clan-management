import { getClanInfo } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MembersList } from "@/components/members-list";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading component
function LoadingMembers() {
  return (
    <div className="flex justify-center items-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading members...</span>
    </div>
  );
}

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
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header Section */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">
          {clanData.name} Members
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage clan members, view stats, and track performance
        </p>
      </div>

      {/* Members List Card */}
      <Card className="shadow grid grid-cols-1 gap-4">
        <CardHeader>
          <CardTitle>Members List</CardTitle>
          <CardDescription>
            {members.length} total members ({members.length}/50)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingMembers />}>
            <MembersList members={sortedMembers} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
