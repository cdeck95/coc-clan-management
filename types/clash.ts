// Define BadgeUrls interface that was missing
export interface BadgeUrls {
  small: string;
  medium: string;
  large: string;
}

export interface Clan {
  tag: string;
  name: string;
  type: string;
  description: string;
  location: {
    id: number;
    name: string;
    isCountry: boolean;
    countryCode: string;
  };
  isFamilyFriendly: boolean;
  badgeUrls: BadgeUrls;
  clanLevel: number;
  clanPoints: number;
  requiredTrophies: number;
  clanBuilderBasePoints: 35848;
  clanCapitalPoints: 3104;
  capitalLeague: { id: 85000015; name: "Master League I" };
  requiredTownhallLevel?: number;
  chatLanguage?: {
    id: number;
    name: string;
    languageCode: string;
  };
  warFrequency: string;
  warWinStreak: number;
  warWins: number;
  warTies: number;
  warLosses: number;
  isWarLogPublic: boolean;
  warLeague: {
    id: number;
    name: string;
  };
  members: number;
  memberList: ClanMember[];
  labels: {
    id: number;
    name: string;
    iconUrls: {
      small: string;
      medium: string;
    };
  }[];
}

export interface ClanMember {
  tag: string;
  name: string;
  role: string;
  expLevel: number;
  league: {
    id: number;
    name: string;
    iconUrls: {
      small: string;
      tiny: string;
      medium: string;
    };
  };
  trophies: number;
  versusTrophies: number;
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
  townHallLevel?: number; // Add this property if not already present
}

// Define WarAttack first to avoid reference issues
export interface WarAttack {
  attackerTag: string;
  defenderTag: string;
  stars: number;
  destructionPercentage: number;
  order: number;
  duration: number;
}

export interface WarMember {
  tag: string;
  name: string;
  mapPosition: number;
  townhallLevel: number;
  opponentAttacks: number;
  bestOpponentAttack?: WarAttack;
  attacks?: WarAttack[];
}

export interface WarClan {
  tag: string;
  name: string;
  badgeUrls: BadgeUrls;
  clanLevel: number;
  attacks: number;
  stars: number;
  destructionPercentage: number;
  members: WarMember[];
}

export interface CurrentWar {
  state: string;
  teamSize: number;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  clan: WarClan;
  opponent: WarClan;
  // Remove attacksPerMember as it's not part of the API response
}

export interface MemberNote {
  id: string;
  memberId: string;
  note: string;
  date: string;
}

export interface MemberStrike {
  id: string;
  memberId: string;
  reason: string;
  date: string;
}

// Add new interfaces for tracking efficiency, banned members, and CWL data
export interface AttackEfficiency {
  memberId: string;
  memberName: string;
  totalAttacks: number;
  totalStars: number;
  totalDestruction: number;
  averageStars: number;
  averageDestruction: number;
  threeStarRate: number;
  lastUpdated: string;
}

export interface BannedMember {
  id: string;
  tag: string;
  name: string;
  reason: string;
  date: string;
}

export interface ClanWarLeagueGroup {
  state: string;
  season: string;
  clans: ClanWarLeagueClan[];
  rounds: ClanWarLeagueRound[];
  warLeague?: WarLeague;
}

export interface ClanWarLeagueClan {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls: BadgeUrls;
  members: ClanWarLeagueMember[];
}

export interface ClanWarLeagueMember {
  tag: string;
  name: string;
  townHallLevel: number;
}

export interface ClanWarLeagueRound {
  warTags: string[];
  rankings?: ClanWarLeagueRanking[];
}

export interface ClanWarLeagueRanking {
  clanTag: string;
  rank: number;
  stars: number;
  destructionPercentage: number;
}

export interface ClanWarLeagueWar {
  state: string;
  teamSize: number;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  clan: WarClan;
  opponent: WarClan;
  warLeague?: WarLeague;
  // Remove attacksPerMember as it's not part of the API response
}

// War-related types
export interface ClanWar {
  state: "notInWar" | "preparation" | "inWar" | "warEnded";
  teamSize: number;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  clan: WarClan;
  opponent: WarClan;
  warTag?: string;
}

export interface WarLeagueGroup {
  state: string;
  season: string;
  clans: LeagueClan[];
  rounds: LeagueRound[];
  warLeague?: WarLeague; // Add this optional property
}

export interface LeagueClan {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls: BadgeUrls;
  members: LeagueClanMember[];
}

export interface LeagueClanMember {
  tag: string;
  name: string;
  townHallLevel: number;
}

export interface LeagueRound {
  warTags: string[];
}

export interface WarLog {
  items: WarLogEntry[];
}

export interface WarLogEntry {
  result: string;
  endTime: string;
  teamSize: number;
  clan: WarClanSummary;
  opponent: WarClanSummary;
  attacksPerMember: number;
  battleModifier: string;
}

export interface WarClanSummary {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls: BadgeUrls;
  attacks?: number;
  stars: number;
  destructionPercentage: number;
}

// Add new interfaces for the League API endpoints
export interface League {
  id: number;
  name: string;
  iconUrls: {
    small: string;
    medium: string;
    large?: string;
  };
}

export interface LeagueSeason {
  id: string;
}

export interface LeagueSeasonRanking {
  clan: {
    tag: string;
    name: string;
    badgeUrls: BadgeUrls;
  };
  rank: number;
  trophies: number;
  expLevel: number;
}

export interface WarLeague {
  id: number;
  name: string;
  iconUrls: {
    small: string;
    medium: string;
    large?: string;
  };
}

// Add the missing Member and ClanInfo types

export interface Member {
  tag: string;
  name: string;
  role: string;
  expLevel: number;
  league?: {
    id: number;
    name: string;
    iconUrls: {
      small: string;
      tiny: string;
      medium: string;
    };
  };
  trophies: number;
  versusTrophies?: number;
  clanRank: number;
  previousClanRank: number;
  donations: number;
  donationsReceived: number;
}

export interface ClanInfo {
  tag: string;
  name: string;
  type: string;
  description: string;
  location?: {
    id: number;
    name: string;
    isCountry: boolean;
    countryCode: string;
  };
  badgeUrls: {
    small: string;
    large: string;
    medium: string;
  };
  clanLevel: number;
  clanPoints: number;
  clanVersusPoints: number;
  requiredTrophies: number;
  warFrequency: string;
  warWinStreak: number;
  warWins: number;
  warTies: number;
  warLosses: number;
  isWarLogPublic: boolean;
  warLeague?: {
    id: number;
    name: string;
  };
  members: number;
  memberList: Member[];
  labels: {
    id: number;
    name: string;
    iconUrls: {
      small: string;
      medium: string;
    };
  }[];
}
