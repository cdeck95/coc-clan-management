import { getBannedMembers } from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Trash2, UserPlus } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function BannedPage() {
  const bannedMembers = await getBannedMembers();

  async function handleRemoveBan(id: string) {
    "use server";
    const { removeBannedMember } = await import("@/lib/api");
    await removeBannedMember(id);
    revalidatePath("/banned");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banned Members</h1>
          <p className="text-muted-foreground mt-2">
            Track players who have been banned or kicked from the clan
          </p>
        </div>
        <div>
          <Link href="/banned/add">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Banned Player
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bannedMembers.length > 0 ? (
          bannedMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Player Tag:</span>
                    <span className="font-mono">{member.tag}</span>
                  </div>
                  <div className="flex flex-col">
                    <span>Reason:</span>
                    <span className="mt-1 p-2 bg-muted rounded-md text-sm">
                      {member.reason}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    Banned{" "}
                    {formatDistanceToNow(new Date(member.date), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <form action={handleRemoveBan.bind(null, member.id)}>
                  <Button variant="outline" size="sm" type="submit">
                    <Trash2 className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No banned members recorded yet. Click &quot;Add Banned
              Player&quot; to add one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
