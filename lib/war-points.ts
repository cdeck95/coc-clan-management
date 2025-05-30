import { ClanWar, WarAttack, WarMember } from "@/types/clash";

export interface WarMemberPoints {
  memberTag: string;
  memberName: string;
  townHallLevel: number;
  mapPosition: number;
  attackPoints: number;
  defensePoints: number;
  totalPoints: number;
  attacksUsed: number;
  timesDefended: number;
  attackHistory: WarAttackResult[];
  defenseHistory: WarDefenseResult[];
}

export interface WarAttackResult {
  defenderTag: string;
  defenderName: string;
  defenderPosition: number;
  stars: number;
  destructionPercentage: number;
  points: number;
  attackOrder: number;
}

export interface WarDefenseResult {
  attackerTag: string;
  attackerName: string;
  attackerPosition: number;
  starsGiven: number;
  destructionPercentage: number;
  points: number;
  attackOrder: number;
}

export interface WarPointsSummary {
  warTag: string;
  warState: string;
  lastUpdated: string;
  memberPoints: WarMemberPoints[];
  topAttacker: WarMemberPoints | null;
  topDefender: WarMemberPoints | null;
  totalAttackPoints: number;
  totalDefensePoints: number;
}

/**
 * Calculate points for an attack based on stars achieved
 * Same scoring system as CWL but accounts for 2 attacks per member
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
 * Calculate war points for all members in a regular war
 */
export function calculateWarPoints(
  war: ClanWar,
  clanTag: string
): WarPointsSummary {
  const memberPointsMap = new Map<string, WarMemberPoints>();

  // Determine which clan is ours
  const ourClan = war.clan.tag === clanTag ? war.clan : war.opponent;
  const opponentClan = war.clan.tag === clanTag ? war.opponent : war.clan;

  // Initialize member points for all our clan members
  ourClan.members.forEach((member) => {
    memberPointsMap.set(member.tag, {
      memberTag: member.tag,
      memberName: member.name,
      townHallLevel: member.townhallLevel,
      mapPosition: member.mapPosition,
      attackPoints: 0,
      defensePoints: 0,
      totalPoints: 0,
      attacksUsed: 0,
      timesDefended: 0,
      attackHistory: [],
      defenseHistory: [],
    });
  });

  // Process attacks by our clan members
  ourClan.members.forEach((member) => {
    if (member.attacks && member.attacks.length > 0) {
      member.attacks.forEach((attack: WarAttack) => {
        const defender = findMemberByTag(
          opponentClan.members,
          attack.defenderTag
        );
        const points = calculateAttackPoints(attack.stars);

        const memberPoints = memberPointsMap.get(member.tag);
        if (memberPoints) {
          memberPoints.attackPoints += points;
          memberPoints.attacksUsed += 1;
          memberPoints.attackHistory.push({
            defenderTag: attack.defenderTag,
            defenderName: defender?.name || "Unknown",
            defenderPosition: defender?.mapPosition || 0,
            stars: attack.stars,
            destructionPercentage: attack.destructionPercentage,
            points,
            attackOrder: attack.order,
          });
          memberPoints.totalPoints =
            memberPoints.attackPoints + memberPoints.defensePoints;
        }
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

          const memberPoints = memberPointsMap.get(defender.tag);
          if (memberPoints) {
            memberPoints.defensePoints += points;
            memberPoints.timesDefended += 1;
            memberPoints.defenseHistory.push({
              attackerTag: member.tag,
              attackerName: member.name,
              attackerPosition: member.mapPosition,
              starsGiven: attack.stars,
              destructionPercentage: attack.destructionPercentage,
              points,
              attackOrder: attack.order,
            });
            memberPoints.totalPoints =
              memberPoints.attackPoints + memberPoints.defensePoints;
          }
        }
      });
    }
  });

  const allMemberPoints = Array.from(memberPointsMap.values()).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  // Find top performers
  const topAttacker = allMemberPoints.reduce(
    (prev, current) =>
      current.attackPoints > prev.attackPoints ? current : prev,
    allMemberPoints[0]
  );

  const topDefender = allMemberPoints.reduce(
    (prev, current) =>
      current.defensePoints > prev.defensePoints ? current : prev,
    allMemberPoints[0]
  );

  const totalAttackPoints = allMemberPoints.reduce(
    (sum, member) => sum + member.attackPoints,
    0
  );
  const totalDefensePoints = allMemberPoints.reduce(
    (sum, member) => sum + member.defensePoints,
    0
  );

  return {
    warTag: war.warTag || `${war.clan.tag}_vs_${war.opponent.tag}`,
    warState: war.state,
    lastUpdated: new Date().toISOString(),
    memberPoints: allMemberPoints,
    topAttacker: topAttacker?.attackPoints > 0 ? topAttacker : null,
    topDefender: topDefender?.defensePoints > 0 ? topDefender : null,
    totalAttackPoints,
    totalDefensePoints,
  };
}

/**
 * Helper function to find a member by their tag
 */
function findMemberByTag(
  members: WarMember[],
  tag: string
): WarMember | undefined {
  return members.find((member) => member.tag === tag);
}

/**
 * Get points summary for a specific member
 */
export function getMemberWarPointsSummary(memberPoints: WarMemberPoints) {
  const avgAttackPoints =
    memberPoints.attacksUsed > 0
      ? memberPoints.attackPoints / memberPoints.attacksUsed
      : 0;
  const avgDefensePoints =
    memberPoints.timesDefended > 0
      ? memberPoints.defensePoints / memberPoints.timesDefended
      : 0;

  // Calculate attack efficiency (attacks used out of max 2)
  const attackEfficiency = (memberPoints.attacksUsed / 2) * 100;

  return {
    ...memberPoints,
    avgAttackPoints: Math.round(avgAttackPoints * 100) / 100,
    avgDefensePoints: Math.round(avgDefensePoints * 100) / 100,
    attackEfficiency,
  };
}

/**
 * Export war points data as CSV format
 */
export function exportWarPointsToCSV(warPoints: WarPointsSummary): string {
  const headers = [
    "Member Name",
    "Member Tag",
    "TH Level",
    "Map Position",
    "Attack Points",
    "Defense Points",
    "Total Points",
    "Attacks Used",
    "Times Defended",
    "Avg Attack Points",
    "Avg Defense Points",
    "Attack Efficiency %",
  ];

  const rows = warPoints.memberPoints.map((member) => {
    const summary = getMemberWarPointsSummary(member);
    return [
      member.memberName,
      member.memberTag,
      member.townHallLevel,
      member.mapPosition,
      member.attackPoints,
      member.defensePoints,
      member.totalPoints,
      member.attacksUsed,
      member.timesDefended,
      summary.avgAttackPoints,
      summary.avgDefensePoints,
      `${summary.attackEfficiency.toFixed(1)}%`,
    ];
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
