import {
  ClanWarLeagueGroup,
  ClanWarLeagueWar,
  WarAttack,
  CWLMemberPoints,
  CWLAttackResult,
  CWLDefenseResult,
  CWLSeasonPoints,
} from "@/types/clash";
import {
  calculateAttackPoints,
  calculateDefensePoints,
  findMemberByTag,
} from "./war-scoring";

/**
 * Process a single war to extract attack and defense results for points calculation
 */
export function processWarForPoints(
  war: ClanWarLeagueWar,
  clanTag: string,
  round: number
): { attackResults: CWLAttackResult[]; defenseResults: CWLDefenseResult[] } {
  const attackResults: CWLAttackResult[] = [];
  const defenseResults: CWLDefenseResult[] = [];
  // Determine which clan is ours
  const ourClan = war.clan.tag === clanTag ? war.clan : war.opponent;
  const opponentClan = war.clan.tag === clanTag ? war.opponent : war.clan;

  // Process attacks by our clan members
  ourClan.members.forEach((member) => {
    if (member.attacks && member.attacks.length > 0) {
      member.attacks.forEach((attack: WarAttack) => {
        const defender = findMemberByTag(
          opponentClan.members,
          attack.defenderTag
        );
        const points = calculateAttackPoints(attack.stars);

        attackResults.push({
          warTag: war.clan.tag + "_vs_" + war.opponent.tag, // Generate a unique war identifier
          round,
          defenderTag: attack.defenderTag,
          defenderName: defender?.name || "Unknown",
          stars: attack.stars,
          destructionPercentage: attack.destructionPercentage,
          points,
          timestamp: war.endTime || war.startTime,
        });
      });
    }
  });
  // Process defenses by our clan members (attacks against us)
  opponentClan.members.forEach((member) => {
    if (member.attacks && member.attacks.length > 0) {
      member.attacks.forEach((attack: WarAttack) => {
        const defender = findMemberByTag(ourClan.members, attack.defenderTag);
        if (defender) {
          const points = calculateDefensePoints(attack.stars);

          defenseResults.push({
            warTag: war.clan.tag + "_vs_" + war.opponent.tag,
            round,
            attackerTag: member.tag,
            attackerName: member.name,
            starsGiven: attack.stars,
            destructionPercentage: attack.destructionPercentage,
            points,
            timestamp: war.endTime || war.startTime,
          });
        }
      });
    }
  });

  return { attackResults, defenseResults };
}

/**
 * Calculate comprehensive CWL points for all members across all war days
 */
export function calculateCWLSeasonPoints(
  leagueGroup: ClanWarLeagueGroup,
  allWars: Record<string, ClanWarLeagueWar>,
  clanTag: string
): CWLSeasonPoints {
  const memberPointsMap = new Map<string, CWLMemberPoints>();
  let completedWarDays = 0;

  // Get our clan members from the league group
  const ourClan = leagueGroup.clans.find((clan) => clan.tag === clanTag);
  if (!ourClan) {
    throw new Error("Clan not found in league group");
  }
  // Initialize member points for all clan members
  ourClan.members.forEach((member) => {
    memberPointsMap.set(member.tag, {
      memberTag: member.tag,
      memberName: member.name,
      attackPoints: 0,
      defensePoints: 0,
      bonusPoints: 0,
      totalPoints: 0,
      attacksUsed: 0,
      timesDefended: 0,
      attackHistory: [],
      defenseHistory: [],
    });
  });

  // Process each round/war day
  leagueGroup.rounds.forEach((round, roundIndex) => {
    round.warTags.forEach((warTag) => {
      if (warTag === "#0") return; // Skip placeholder wars

      const war = allWars[warTag];
      if (!war || war.state !== "warEnded") return; // Only process completed wars

      // Check if our clan participated in this war
      const isOurWar = war.clan.tag === clanTag || war.opponent.tag === clanTag;
      if (!isOurWar) return;

      const { attackResults, defenseResults } = processWarForPoints(
        war,
        clanTag,
        roundIndex + 1
      );

      // Process attack results - find which member made each attack
      attackResults.forEach((attackResult) => {
        // Find the member who made this attack by matching the attack details
        const ourClanInWar = war.clan.tag === clanTag ? war.clan : war.opponent;
        ourClanInWar.members.forEach((warMember) => {
          if (warMember.attacks) {
            const matchingAttack = warMember.attacks.find(
              (attack) =>
                attack.defenderTag === attackResult.defenderTag &&
                attack.stars === attackResult.stars &&
                attack.destructionPercentage ===
                  attackResult.destructionPercentage
            );

            if (matchingAttack) {
              const member = memberPointsMap.get(warMember.tag);
              if (member) {
                member.attackPoints += attackResult.points;
                member.attacksUsed += 1;
                member.attackHistory.push(attackResult);
                member.totalPoints =
                  member.attackPoints +
                  member.defensePoints +
                  member.bonusPoints;
              }
            }
          }
        });
      });

      // Process defense results
      defenseResults.forEach((defenseResult) => {
        // The defenseResult contains the tag of the defender (our clan member who was attacked)
        // We need to find this member by looking for the defenderTag in the attack that created this defense result
        const opponentClanInWar =
          war.clan.tag === clanTag ? war.opponent : war.clan;
        opponentClanInWar.members.forEach((opponentMember) => {
          if (opponentMember.attacks) {
            const matchingAttack = opponentMember.attacks.find(
              (attack) =>
                attack.defenderTag &&
                attack.stars === defenseResult.starsGiven &&
                attack.destructionPercentage ===
                  defenseResult.destructionPercentage
            );

            if (matchingAttack) {
              const defender = memberPointsMap.get(matchingAttack.defenderTag);
              if (defender) {
                defender.defensePoints += defenseResult.points;
                defender.timesDefended += 1;
                defender.defenseHistory.push(defenseResult);
                defender.totalPoints =
                  defender.attackPoints +
                  defender.defensePoints +
                  defender.bonusPoints;
              }
            }
          }
        });
      });

      completedWarDays++;
    });
  });

  // Calculate Perfect CWL Bonus (3 points for perfect performance)
  // Award bonus to members who achieved 3 stars in every single attack
  memberPointsMap.forEach((member) => {
    if (member.attacksUsed > 0) {
      const allPerfectAttacks = member.attackHistory.every(
        (attack) => attack.stars === 3
      );

      if (allPerfectAttacks) {
        member.bonusPoints += 3;
        member.totalPoints =
          member.attackPoints + member.defensePoints + member.bonusPoints;
      }
    }
  });

  return {
    season: leagueGroup.season,
    clanTag,
    lastUpdated: new Date().toISOString(),
    memberPoints: Array.from(memberPointsMap.values()).sort(
      (a, b) => b.totalPoints - a.totalPoints
    ),
    totalWarDays: leagueGroup.rounds.length,
    completedWarDays: Math.min(completedWarDays, leagueGroup.rounds.length), // Ensure completed rounds do not exceed total rounds
  };
}

/**
 * Get points summary for a specific member
 */
export function getMemberPointsSummary(
  memberPoints: CWLMemberPoints,
  totalRounds: number
) {
  const avgAttackPoints =
    memberPoints.attacksUsed > 0
      ? memberPoints.attackPoints / memberPoints.attacksUsed
      : 0;
  const avgDefensePoints =
    memberPoints.timesDefended > 0
      ? memberPoints.defensePoints / memberPoints.timesDefended
      : 0;

  return {
    ...memberPoints,
    avgAttackPoints: Math.round(avgAttackPoints * 100) / 100,
    avgDefensePoints: Math.round(avgDefensePoints * 100) / 100,
    participationRate: (memberPoints.attacksUsed / totalRounds) * 100,
  };
}

/**
 * Export points data as CSV format
 */
export function exportPointsToCSV(seasonPoints: CWLSeasonPoints): string {
  const headers = [
    "Member Name",
    "Member Tag",
    "Attack Points",
    "Defense Points",
    "Bonus Points",
    "Total Points",
    "Attacks Used",
    "Times Defended",
    "Avg Attack Points",
    "Avg Defense Points",
    "Participation Rate (%)",
  ];

  const rows = seasonPoints.memberPoints.map((member) => {
    const summary = getMemberPointsSummary(member, seasonPoints.totalWarDays);
    return [
      member.memberName,
      member.memberTag,
      member.attackPoints,
      member.defensePoints,
      member.bonusPoints,
      member.totalPoints,
      member.attacksUsed,
      member.timesDefended,
      summary.avgAttackPoints,
      summary.avgDefensePoints,
      summary.participationRate,
    ];
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
