export interface Adventurer {
  id: string;
  address: string;
  tokenId: string;
  owner: string;
  archetype: string;
  level: string;
  xp: string;
  battles: string;
  battleWins: string;
  battleLosses: string;
  // Stats
  wins?: string;
  animaEarned?: string;
  xpEarned?: string;
  winStreak?: string;
  upsetWins?: string;
  biggestAnimaWin?: string;
  homagePaid?: string;
}