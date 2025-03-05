"use client";

import { useEffect, useState } from "react";
import { ClanMember, MemberNote, MemberStrike } from "@/types/clash";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberNoteDialog } from "@/components/member-note-dialog";
import { MemberStrikeDialog } from "@/components/member-strike-dialog";
import { getDonationRatio, getRoleColor } from "@/lib/utils";
import {
  getMemberNotesByMemberId,
  getMemberStrikesByMemberId,
  deleteMemberNote,
  deleteMemberStrike,
} from "@/lib/api";
import { Trash2 } from "lucide-react";
import LoadingSpinner from "./ui/loading-spinner";

interface MemberCardProps {
  member: ClanMember;
}

export function MemberCard({ member }: MemberCardProps) {
  const [notes, setNotes] = useState<MemberNote[]>([]);
  const [strikes, setStrikes] = useState<MemberStrike[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMemberData();
  }, [member.tag]);

  const loadMemberData = async () => {
    setLoading(true);
    try {
      const fetchedNotes = await getMemberNotesByMemberId(member.tag);
      const fetchedStrikes = await getMemberStrikesByMemberId(member.tag);

      setNotes(fetchedNotes);
      setStrikes(fetchedStrikes);
    } catch (error) {
      console.error("Error loading member data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteMemberNote(noteId);
      await loadMemberData();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleDeleteStrike = async (strikeId: string) => {
    try {
      await deleteMemberStrike(strikeId);
      await loadMemberData();
    } catch (error) {
      console.error("Error deleting strike:", error);
    }
  };

  const donationRatio = getDonationRatio(
    member.donations,
    member.donationsReceived
  );
  const formattedDonationRatio =
    donationRatio === Infinity ? "∞" : donationRatio.toFixed(1);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">{member.name}</CardTitle>
        <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">Level: {member.expLevel}</div>
          <div className="text-sm">Trophies: {member.trophies}</div>
          <div className="text-sm">Donations: {member.donations}</div>
          <div className="text-sm">Received: {member.donationsReceived}</div>
          <div className="text-sm">
            Donation Ratio: {formattedDonationRatio}
          </div>
          <div className="text-sm">Clan Rank: {member.clanRank}</div>
          <div className="text-sm">
            {member.previousClanRank < member.clanRank
              ? "↓"
              : member.previousClanRank > member.clanRank
              ? "↑"
              : "="}
            {member.previousClanRank}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {notes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-muted p-2 rounded-md mb-2 text-xs flex justify-between items-start"
                  >
                    <p>{note.note}</p>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {strikes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Strikes</h4>
                {strikes.map((strike) => (
                  <div
                    key={strike.id}
                    className="bg-destructive/10 p-2 rounded-md mb-2 text-xs flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">{strike.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(strike.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteStrike(strike.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 gap-2">
        <MemberNoteDialog
          memberId={member.tag}
          memberName={member.name}
          onNoteSaved={loadMemberData}
        />
        <MemberStrikeDialog
          memberId={member.tag}
          memberName={member.name}
          onStrikeSaved={loadMemberData}
        />
      </CardFooter>
    </Card>
  );
}
