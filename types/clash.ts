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
  badgeUrls: {
    small: string;
    large: string;
    medium: string;
  };
  clanLevel: number;
  clanPoints: number;
  clanVersusPoints: number;
  requiredTrophies: number;
  // Add the missing properties
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
}

export interface CurrentWar {
  state: string;
  teamSize: number;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  clan: WarClan;
  opponent: WarClan;
}

export interface WarClan {
  tag: string;
  name: string;
  badgeUrls: {
    small: string;
    large: string;
    medium: string;
  };
  clanLevel: number;
  attacks: number;
  stars: number;
  destructionPercentage: number;
  members: WarMember[];
}

export interface WarMember {
  tag: string;
  name: string;
  mapPosition: number;
  townhallLevel: number;
  opponentAttacks: number;
  bestOpponentAttack?: {
    attackerTag: string;
    defenderTag: string;
    stars: number;
    destructionPercentage: number;
    order: number;
  };
  attacks?: {
    attackerTag: string;
    defenderTag: string;
    stars: number;
    destructionPercentage: number;
    order: number;
  }[];
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
}

export interface ClanWarLeagueClan {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls: {
    small: string;
    medium: string;
    large: string;
  };
  members: ClanWarLeagueMember[];
}

export interface ClanWarLeagueMember {
  tag: string;
  name: string;
  townHallLevel: number;
}

export interface ClanWarLeagueRound {
  warTags: string[];
}

export interface ClanWarLeagueWar {
  state: string;
  teamSize: number;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  clan: WarClan;
  opponent: WarClan;
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
    badgeUrls: {
      small: string;
      medium: string;
      large: string;
    };
  };
  rank: number;
  trophies: number;
  expLevel: number;
}

export interface WarLeague {
  id: number;
  name: string;
}

// Enhanced CWL types for more comprehensive data
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
  badgeUrls: {
    small: string;
    medium: string;
    large: string;
  };
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
}
