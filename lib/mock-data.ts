import { Clan, CurrentWar, ClanWarLeagueGroup } from "@/types/clash";

// Mock data for clan information
export const MOCK_CLAN_DATA: Clan = {
  tag: "#GCVL29VJ",
  name: "War Boiz",
  type: "inviteOnly",
  description:
    "Mock data - API connection failed. This is placeholder content until the API is properly configured.",
  location: {
    id: 32000006,
    name: "United States",
    isCountry: true,
    countryCode: "US",
  },
  badgeUrls: {
    small:
      "https://api-assets.clashofclans.com/badges/70/0Yfl3BOyGB2kLnb5-YfIxN3MW7ufFYKEd2X5MT58JJk.png",
    large:
      "https://api-assets.clashofclans.com/badges/512/0Yfl3BOyGB2kLnb5-YfIxN3MW7ufFYKEd2X5MT58JJk.png",
    medium:
      "https://api-assets.clashofclans.com/badges/200/0Yfl3BOyGB2kLnb5-YfIxN3MW7ufFYKEd2X5MT58JJk.png",
  },
  clanLevel: 10,
  clanPoints: 30000,
  clanVersusPoints: 20000,
  requiredTrophies: 2000,
  requiredTownhallLevel: 12,
  warFrequency: "always",
  warWinStreak: 5,
  warWins: 100,
  warTies: 10,
  warLosses: 30,
  isWarLogPublic: true,
  warLeague: {
    id: 48000012,
    name: "Crystal League I",
  },
  members: 30,
  memberList: [
    {
      tag: "#PLAYER1",
      name: "Leader Player",
      role: "leader",
      expLevel: 200,
      league: {
        id: 29000022,
        name: "Legend League",
        iconUrls: {
          small:
            "https://api-assets.clashofclans.com/leagues/72/R6uM7XoB1ni3KS0WjC6itMeAUWxcrM1Clm9fNtWodlQ.png",
          tiny: "https://api-assets.clashofclans.com/leagues/36/R6uM7XoB1ni3KS0WjC6itMeAUWxcrM1Clm9fNtWodlQ.png",
          medium:
            "https://api-assets.clashofclans.com/leagues/288/R6uM7XoB1ni3KS0WjC6itMeAUWxcrM1Clm9fNtWodlQ.png",
        },
      },
      trophies: 5500,
      versusTrophies: 3000,
      clanRank: 1,
      previousClanRank: 1,
      donations: 1200,
      donationsReceived: 400,
    },
    {
      tag: "#PLAYER2",
      name: "Co-Leader Player",
      role: "coLeader",
      expLevel: 180,
      league: {
        id: 29000021,
        name: "Titan League I",
        iconUrls: {
          small:
            "https://api-assets.clashofclans.com/leagues/72/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
          tiny: "https://api-assets.clashofclans.com/leagues/36/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
          medium:
            "https://api-assets.clashofclans.com/leagues/288/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
        },
      },
      trophies: 5200,
      versusTrophies: 2900,
      clanRank: 2,
      previousClanRank: 2,
      donations: 1000,
      donationsReceived: 300,
    },
    {
      tag: "#PLAYER3",
      name: "Elder Player",
      role: "elder",
      expLevel: 160,
      league: {
        id: 29000020,
        name: "Titan League II",
        iconUrls: {
          small:
            "https://api-assets.clashofclans.com/leagues/72/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
          tiny: "https://api-assets.clashofclans.com/leagues/36/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
          medium:
            "https://api-assets.clashofclans.com/leagues/288/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
        },
      },
      trophies: 4800,
      versusTrophies: 2800,
      clanRank: 3,
      previousClanRank: 3,
      donations: 800,
      donationsReceived: 600,
    },
    {
      tag: "#PLAYER4",
      name: "Member Player",
      role: "member",
      expLevel: 140,
      league: {
        id: 29000019,
        name: "Titan League III",
        iconUrls: {
          small:
            "https://api-assets.clashofclans.com/leagues/72/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
          tiny: "https://api-assets.clashofclans.com/leagues/36/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
          medium:
            "https://api-assets.clashofclans.com/leagues/288/qVCZmW5zF-QOxYJSoMnrIOgS-sZ1hSmBFbgRP7RIP7E.png",
        },
      },
      trophies: 4500,
      versusTrophies: 2700,
      clanRank: 4,
      previousClanRank: 5,
      donations: 200,
      donationsReceived: 800,
    },
    {
      tag: "#PLAYER5",
      name: "New Member",
      role: "member",
      expLevel: 120,
      league: {
        id: 29000018,
        name: "Champion League I",
        iconUrls: {
          small:
            "https://api-assets.clashofclans.com/leagues/72/9v_04LHmd1LWq7IoY45dAdGhrBkrc2ZFzAVpkxtEQ5E.png",
          tiny: "https://api-assets.clashofclans.com/leagues/36/9v_04LHmd1LWq7IoY45dAdGhrBkrc2ZFzAVpkxtEQ5E.png",
          medium:
            "https://api-assets.clashofclans.com/leagues/288/9v_04LHmd1LWq7IoY45dAdGhrBkrc2ZFzAVpkxtEQ5E.png",
        },
      },
      trophies: 3800,
      versusTrophies: 2200,
      clanRank: 5,
      previousClanRank: 4,
      donations: 100,
      donationsReceived: 400,
    },
  ],
  labels: [
    {
      id: 56000000,
      name: "Clan Wars",
      iconUrls: {
        small:
          "https://api-assets.clashofclans.com/labels/64/lXaIuoTlfoNOY5fKcQGeT57apz1KFWkN9-raxqIlMbE.png",
        medium:
          "https://api-assets.clashofclans.com/labels/128/lXaIuoTlfoNOY5fKcQGeT57apz1KFWkN9-raxqIlMbE.png",
      },
    },
    {
      id: 56000001,
      name: "Clan War League",
      iconUrls: {
        small:
          "https://api-assets.clashofclans.com/labels/64/5w60_3bdtYUe9SM6rkxBRyV_8VvWw_jTlDS5ieU3IsI.png",
        medium:
          "https://api-assets.clashofclans.com/labels/128/5w60_3bdtYUe9SM6rkxBRyV_8VvWw_jTlDS5ieU3IsI.png",
      },
    },
    {
      id: 56000009,
      name: "Donations",
      iconUrls: {
        small:
          "https://api-assets.clashofclans.com/labels/64/RauzS-02tv4vWm1edZ-q3gPQGWKGANLZ-85HCw_NVP0.png",
        medium:
          "https://api-assets.clashofclans.com/labels/128/RauzS-02tv4vWm1edZ-q3gPQGWKGANLZ-85HCw_NVP0.png",
      },
    },
  ],
};

// Mock data for current war
export const MOCK_WAR_DATA: CurrentWar = {
  state: "inWar",
  teamSize: 15,
  preparationStartTime: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
  startTime: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  endTime: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
  clan: {
    tag: "#GCVL29VJ",
    name: "War Boiz",
    badgeUrls: {
      small:
        "https://api-assets.clashofclans.com/badges/70/0Yfl3BOyGB2kLnb5-YfIxN3MW7ufFYKEd2X5MT58JJk.png",
      large:
        "https://api-assets.clashofclans.com/badges/512/0Yfl3BOyGB2kLnb5-YfIxN3MW7ufFYKEd2X5MT58JJk.png",
      medium:
        "https://api-assets.clashofclans.com/badges/200/0Yfl3BOyGB2kLnb5-YfIxN3MW7ufFYKEd2X5MT58JJk.png",
    },
    clanLevel: 10,
    attacks: 18,
    stars: 35,
    destructionPercentage: 85.5,
    members: [
      {
        tag: "#PLAYER1",
        name: "Leader Player",
        mapPosition: 1,
        townhallLevel: 14,
        opponentAttacks: 1,
        bestOpponentAttack: {
          attackerTag: "#OPPONENT1",
          defenderTag: "#PLAYER1",
          stars: 2,
          destructionPercentage: 80,
          order: 1,
        },
        attacks: [
          {
            attackerTag: "#PLAYER1",
            defenderTag: "#OPPONENT1",
            stars: 3,
            destructionPercentage: 100,
            order: 1,
          },
          {
            attackerTag: "#PLAYER1",
            defenderTag: "#OPPONENT2",
            stars: 2,
            destructionPercentage: 85,
            order: 15,
          },
        ],
      },
      {
        tag: "#PLAYER2",
        name: "Co-Leader Player",
        mapPosition: 2,
        townhallLevel: 13,
        opponentAttacks: 1,
        bestOpponentAttack: {
          attackerTag: "#OPPONENT3",
          defenderTag: "#PLAYER2",
          stars: 2,
          destructionPercentage: 90,
          order: 3,
        },
        attacks: [
          {
            attackerTag: "#PLAYER2",
            defenderTag: "#OPPONENT3",
            stars: 2,
            destructionPercentage: 88,
            order: 5,
          },
        ],
      },
      {
        tag: "#PLAYER3",
        name: "Elder Player",
        mapPosition: 3,
        townhallLevel: 13,
        opponentAttacks: 0,
        attacks: [
          {
            attackerTag: "#PLAYER3",
            defenderTag: "#OPPONENT4",
            stars: 3,
            destructionPercentage: 100,
            order: 7,
          },
          {
            attackerTag: "#PLAYER3",
            defenderTag: "#OPPONENT5",
            stars: 2,
            destructionPercentage: 92,
            order: 18,
          },
        ],
      },
    ],
  },
  opponent: {
    tag: "#OPPONENTCLAN",
    name: "Enemy Clan",
    badgeUrls: {
      small:
        "https://api-assets.clashofclans.com/badges/70/LuuuUIMCMl8K3Si9qNSY7LR6XrBd6oj0LcuJnMLG624.png",
      large:
        "https://api-assets.clashofclans.com/badges/512/LuuuUIMCMl8K3Si9qNSY7LR6XrBd6oj0LcuJnMLG624.png",
      medium:
        "https://api-assets.clashofclans.com/badges/200/LuuuUIMCMl8K3Si9qNSY7LR6XrBd6oj0LcuJnMLG624.png",
    },
    clanLevel: 9,
    attacks: 15,
    stars: 30,
    destructionPercentage: 78.2,
    members: [
      {
        tag: "#OPPONENT1",
        name: "Enemy Leader",
        mapPosition: 1,
        townhallLevel: 14,
        opponentAttacks: 1,
        bestOpponentAttack: {
          attackerTag: "#PLAYER1",
          defenderTag: "#OPPONENT1",
          stars: 3,
          destructionPercentage: 100,
          order: 1,
        },
        attacks: [
          {
            attackerTag: "#OPPONENT1",
            defenderTag: "#PLAYER1",
            stars: 2,
            destructionPercentage: 80,
            order: 2,
          },
          {
            attackerTag: "#OPPONENT1",
            defenderTag: "#PLAYER4",
            stars: 3,
            destructionPercentage: 100,
            order: 10,
          },
        ],
      },
      {
        tag: "#OPPONENT2",
        name: "Enemy Co-Leader",
        mapPosition: 2,
        townhallLevel: 13,
        opponentAttacks: 1,
        bestOpponentAttack: {
          attackerTag: "#PLAYER1",
          defenderTag: "#OPPONENT2",
          stars: 2,
          destructionPercentage: 85,
          order: 15,
        },
        attacks: [
          {
            attackerTag: "#OPPONENT2",
            defenderTag: "#PLAYER5",
            stars: 3,
            destructionPercentage: 100,
            order: 4,
          },
        ],
      },
      {
        tag: "#OPPONENT3",
        name: "Enemy Elder",
        mapPosition: 3,
        townhallLevel: 13,
        opponentAttacks: 1,
        bestOpponentAttack: {
          attackerTag: "#PLAYER2",
          defenderTag: "#OPPONENT3",
          stars: 2,
          destructionPercentage: 88,
          order: 5,
        },
        attacks: [
          {
            attackerTag: "#OPPONENT3",
            defenderTag: "#PLAYER2",
            stars: 2,
            destructionPercentage: 90,
            order: 3,
          },
        ],
      },
    ],
  },
};

// Mock data for CWL group
export const MOCK_CWL_GROUP_DATA: ClanWarLeagueGroup = {
  state: "inWar",
  season: new Date().toISOString().substring(0, 7), // Current year-month
  clans: [
    {
      tag: "#GCVL29VJ",
      name: "War Boiz",
      clanLevel: 10,
      badgeUrls: MOCK_CLAN_DATA.badgeUrls,
      members: MOCK_CLAN_DATA.memberList.map((m) => ({
        tag: m.tag,
        name: m.name,
        townHallLevel: 13, // Assume TH13 for mock data
      })),
    },
    {
      tag: "#OPPONENT1",
      name: "Clan Alpha",
      clanLevel: 9,
      badgeUrls: {
        small:
          "https://api-assets.clashofclans.com/badges/70/LuuuUIMCMl8K3Si9qNSY7LR6XrBd6oj0LcuJnMLG624.png",
        medium:
          "https://api-assets.clashofclans.com/badges/200/LuuuUIMCMl8K3Si9qNSY7LR6XrBd6oj0LcuJnMLG624.png",
        large:
          "https://api-assets.clashofclans.com/badges/512/LuuuUIMCMl8K3Si9qNSY7LR6XrBd6oj0LcuJnMLG624.png",
      },
      members: [
        { tag: "#PA1", name: "Player A1", townHallLevel: 14 },
        { tag: "#PA2", name: "Player A2", townHallLevel: 13 },
      ],
    },
    {
      tag: "#OPPONENT2",
      name: "Clan Beta",
      clanLevel: 11,
      badgeUrls: {
        small:
          "https://api-assets.clashofclans.com/badges/70/H39b_-WLZGtZVWQ0hqTkE-Tn2AaQnQWy_Iz4yBlvL0M.png",
        medium:
          "https://api-assets.clashofclans.com/badges/200/H39b_-WLZGtZVWQ0hqTkE-Tn2AaQnQWy_Iz4yBlvL0M.png",
        large:
          "https://api-assets.clashofclans.com/badges/512/H39b_-WLZGtZVWQ0hqTkE-Tn2AaQnQWy_Iz4yBlvL0M.png",
      },
      members: [
        { tag: "#PB1", name: "Player B1", townHallLevel: 14 },
        { tag: "#PB2", name: "Player B2", townHallLevel: 13 },
      ],
    },
    {
      tag: "#OPPONENT3",
      name: "Clan Gamma",
      clanLevel: 8,
      badgeUrls: {
        small:
          "https://api-assets.clashofclans.com/badges/70/2UpP9La5lDzCCMpzBGQn-vxUOf_rYxwB92xf9IdV-ZQ.png",
        medium:
          "https://api-assets.clashofclans.com/badges/200/2UpP9La5lDzCCMpzBGQn-vxUOf_rYxwB92xf9IdV-ZQ.png",
        large:
          "https://api-assets.clashofclans.com/badges/512/2UpP9La5lDzCCMpzBGQn-vxUOf_rYxwB92xf9IdV-ZQ.png",
      },
      members: [
        { tag: "#PC1", name: "Player C1", townHallLevel: 14 },
        { tag: "#PC2", name: "Player C2", townHallLevel: 13 },
      ],
    },
    {
      tag: "#OPPONENT4",
      name: "Clan Delta",
      clanLevel: 10,
      badgeUrls: {
        small:
          "https://api-assets.clashofclans.com/badges/70/2kjz7SrsRPYUi0YO6sNrhx6zwP-ZYWn1cBu_9SZqoFo.png",
        medium:
          "https://api-assets.clashofclans.com/badges/200/2kjz7SrsRPYUi0YO6sNrhx6zwP-ZYWn1cBu_9SZqoFo.png",
        large:
          "https://api-assets.clashofclans.com/badges/512/2kjz7SrsRPYUi0YO6sNrhx6zwP-ZYWn1cBu_9SZqoFo.png",
      },
      members: [
        { tag: "#PD1", name: "Player D1", townHallLevel: 14 },
        { tag: "#PD2", name: "Player D2", townHallLevel: 13 },
      ],
    },
    {
      tag: "#OPPONENT5",
      name: "Clan Epsilon",
      clanLevel: 9,
      badgeUrls: {
        small:
          "https://api-assets.clashofclans.com/badges/70/iq9t0y9y9vJALJUhP9CAvAnNe7k1kTH1rxG8EfC0JYQ.png",
        medium:
          "https://api-assets.clashofclans.com/badges/200/iq9t0y9y9vJALJUhP9CAvAnNe7k1kTH1rxG8EfC0JYQ.png",
        large:
          "https://api-assets.clashofclans.com/badges/512/iq9t0y9y9vJALJUhP9CAvAnNe7k1kTH1rxG8EfC0JYQ.png",
      },
      members: [
        { tag: "#PE1", name: "Player E1", townHallLevel: 14 },
        { tag: "#PE2", name: "Player E2", townHallLevel: 13 },
      ],
    },
    {
      tag: "#OPPONENT6",
      name: "Clan Zeta",
      clanLevel: 12,
      badgeUrls: {
        small:
          "https://api-assets.clashofclans.com/badges/70/zVebQriJ04_5DVC7TyobBBsOL4nziU6vhM9I9gR6csw.png",
        medium:
          "https://api-assets.clashofclans.com/badges/200/zVebQriJ04_5DVC7TyobBBsOL4nziU6vhM9I9gR6csw.png",
        large:
          "https://api-assets.clashofclans.com/badges/512/zVebQriJ04_5DVC7TyobBBsOL4nziU6vhM9I9gR6csw.png",
      },
      members: [
        { tag: "#PF1", name: "Player F1", townHallLevel: 14 },
        { tag: "#PF2", name: "Player F2", townHallLevel: 13 },
      ],
    },
    {
      tag: "#OPPONENT7",
      name: "Clan Eta",
      clanLevel: 10,
      badgeUrls: {
        small:
          "https://api-assets.clashofclans.com/badges/70/Yi8TRUZpVR3g6Ml7rulaBT1-fHXXZ0JjzE_zdd17X3s.png",
        medium:
          "https://api-assets.clashofclans.com/badges/200/Yi8TRUZpVR3g6Ml7rulaBT1-fHXXZ0JjzE_zdd17X3s.png",
        large:
          "https://api-assets.clashofclans.com/badges/512/Yi8TRUZpVR3g6Ml7rulaBT1-fHXXZ0JjzE_zdd17X3s.png",
      },
      members: [
        { tag: "#PG1", name: "Player G1", townHallLevel: 14 },
        { tag: "#PG2", name: "Player G2", townHallLevel: 13 },
      ],
    },
  ],
  rounds: [
    {
      warTags: ["#WAR1A", "#WAR1B", "#WAR1C", "#WAR1D"],
    },
    {
      warTags: ["#WAR2A", "#WAR2B", "#WAR2C", "#WAR2D"],
    },
    {
      warTags: ["#WAR3A", "#WAR3B", "#WAR3C", "#WAR3D"],
    },
    {
      warTags: ["#WAR4A", "#WAR4B", "#WAR4C", "#WAR4D"],
    },
    {
      warTags: ["#WAR5A", "#WAR5B", "#WAR5C", "#WAR5D"],
    },
    {
      warTags: ["#WAR6A", "#WAR6B", "#WAR6C", "#WAR6D"],
    },
    {
      warTags: ["#WAR7A", "#WAR7B", "#WAR7C", "#WAR7D"],
    },
  ],
};
