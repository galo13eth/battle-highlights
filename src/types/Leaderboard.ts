export interface Leaderboard {
  name: string;
  graphqlProp: string;
};

export const LEADERBOARDS: Leaderboard[] = [
  {
    name: 'Overall Wins',
    graphqlProp: 'wins',
  },
  {
    name: 'Weekly Anima',
    graphqlProp: 'animaEarned',
  },
  {
    name: 'Biggest Win',
    graphqlProp: 'biggestAnimaWin',
  },
  {
    name: 'Win Streak',
    graphqlProp: 'winStreak',
  },
  {
    name: 'Most Upsets',
    graphqlProp: 'upsetWins',
  }
];