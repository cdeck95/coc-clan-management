/**
 * Shared war scoring functions used by both CWL and regular war points systems
 */

/**
 * Helper function to find a member by their tag from a list of members
 * Generic function that works with any member type that has tag and name properties
 */
export function findMemberByTag<T extends { tag: string; name: string }>(
  members: T[],
  tag: string
): T | undefined {
  return members.find((member) => member.tag === tag);
}

/**
 * Calculate points for an attack based on stars achieved
 *
 * Scoring system:
 * - 3 stars: +2 points (excellent)
 * - 2 stars: +1 point (good)
 * - 1 star: -3 points (poor)
 * - 0 stars: -3 points (very poor)
 */
export function calculateAttackPoints(stars: number): number {
  switch (stars) {
    case 3:
      return 2;
    case 2:
      return 1;
    case 1:
      return -1;
    case 0:
      return -3;
    default:
      return 0;
  }
}

/**
 * Calculate points for defense based on stars given to attacker
 *
 * Scoring system:
 * - 0 stars given (perfect defense): +3 points
 * - 1 star given (strong defense): +2 points
 * - 2 stars given (okay defense): +1 point
 * - 3 stars given (failed defense): 0 points
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
