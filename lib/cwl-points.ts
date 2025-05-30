import {
  ClanWarLeagueGroup,
  ClanWarLeagueWar,
  WarAttack,
  CWLMemberPoints,
  CWLAttackResult,
  CWLDefenseResult,
  CWLSeasonPoints,
} from "@/types/clash";

/**
 * Calculate points for an attack based on stars achieved
 */
export function calculateAttackPoints(stars: number): number {
  switch (stars) {
    case 3:
      return 2;
    case 2:
      return 1;
    case 1:
      return -3;
    case 0:
      return -3;
    default:
      return 0;
  }
}

/**
 * Calculate points for defense based on stars given to attacker
 */
export function calculateDefensePoints(starsGiven: number): number {
  switch (starsGiven) {
    case 0:
      return 3; // Perfect defense
    case 1:
      return 2;
    case 2:
      return 1;
    case 3:
      return 0; // No points for getting 3-starred
    default:
      return 0;
  }
}

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
                member.totalPoints = member.attackPoints + member.defensePoints;
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
                  defender.attackPoints + defender.defensePoints;
              }
            }
          }
        });
      });

      completedWarDays++;
    });
  });

  return {
    season: leagueGroup.season,
    clanTag,
    lastUpdated: new Date().toISOString(),
    memberPoints: Array.from(memberPointsMap.values()).sort(
      (a, b) => b.totalPoints - a.totalPoints
    ),
    totalWarDays: leagueGroup.rounds.length,
    completedWarDays: Math.floor(completedWarDays / leagueGroup.clans.length), // Approximate completed rounds
  };
}

/**
 * Helper function to find a member by their tag
 */
function findMemberByTag(
  members: { tag: string; name: string }[],
  tag: string
): { tag: string; name: string } | undefined {
  return members.find((member) => member.tag === tag);
}

/**
 * Get points summary for a specific member
 */
export function getMemberPointsSummary(memberPoints: CWLMemberPoints) {
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
    participationRate: (memberPoints.attacksUsed / 7) * 100, // Assuming 7 war days max
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
    "Total Points",
    "Attacks Used",
    "Times Defended",
    "Avg Attack Points",
    "Avg Defense Points",
  ];

  const rows = seasonPoints.memberPoints.map((member) => {
    const summary = getMemberPointsSummary(member);
    return [
      member.memberName,
      member.memberTag,
      member.attackPoints,
      member.defensePoints,
      member.totalPoints,
      member.attacksUsed,
      member.timesDefended,
      summary.avgAttackPoints,
      summary.avgDefensePoints,
    ];
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
