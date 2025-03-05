import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBannedMembers } from "@/lib/api";
import { BannedMember } from "@/types/clash";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default async function BannedPage() {
  // Add error handling with fallback
  let bannedMembers: BannedMember[] = [];
  let error = null;

  try {
    bannedMembers = await getBannedMembers();
  } catch (err) {
    console.error("Error loading banned members:", err);
    error = "Failed to load banned members list";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banned Members List</CardTitle>
        <CardDescription className="flex flex-row items-center justify-between">
          Members who are not allowed to rejoin the clan
          <Link href="/banned/add">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Banned Player
            </Button>
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : bannedMembers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell className="font-mono">{member.tag}</TableCell>
                  <TableCell>{member.reason}</TableCell>
                  <TableCell>
                    {new Date(member.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            No banned members found. This list will show any players who have
            been banned from joining the clan.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
