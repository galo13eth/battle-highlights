import { State } from '../types/State.js';
import { Adventurer } from '../types/Adventurer.js';
import { LEADERBOARDS } from '../types/Leaderboard.js';
import { ADDRESSES, INVERTED_ADDRESSES } from '../config/addresses.js';
import retry from 'async-retry';

export const fetchSingleLeaderboardData = async (state: State, orderBy: string, address: string): Promise<Adventurer[]> => {
  const whereClause = address != 'general' ? `, where: { address: "${address}" }` : '';

  const LEADERBOARD_QUERY = `
    {
      adventurers(first: 50, orderBy: ${orderBy}, orderDirection: desc${whereClause}) {
        id
        address
        tokenId
        owner
        level
        xp
        battles
        battleWins
        battleLosses
        wins
        animaEarned
        xpEarned
        winStreak
        upsetWins
        biggestAnimaWin
        homagePaid
      }
    }
  `;

  try {
    const result = await state.graphqlClient.request(LEADERBOARD_QUERY) as { adventurers: Adventurer[] };
    return result.adventurers;
  }
  catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchAllLeaderboardsData = async (state: State): Promise<Record<string, Adventurer[]>> => {
  let LEADERBOARD_QUERY = '{\n';
  LEADERBOARD_QUERY += generateLeaderboardQuery();
  LEADERBOARD_QUERY += generateLeaderboardQuery(ADDRESSES.Smol);
  LEADERBOARD_QUERY += generateLeaderboardQuery(ADDRESSES.TalesHero);
  LEADERBOARD_QUERY += '}';

  try {
    return await retry(async () => {
      try {
        const result = await state.graphqlClient.request(LEADERBOARD_QUERY) as Record<string, Adventurer[]>;
        return result;
      } catch (err) {
        console.error(`Error: ${err}, retrying...`);
        throw err;
      }
    }, {
      retries: 5,
      minTimeout: 1000,
      factor: 2,
    });
  } catch (error) {
    console.log(`Max retries reached, error: ${error}`);
    return {};
  }
};

function generateLeaderboardQuery(address?: string): string {
  let query = '';
  LEADERBOARDS.forEach(({ graphqlProp }) => {
    const whereClause = address ? `, where: { address: "${address}" }` : '';
    const prop = address ? `${graphqlProp}_${INVERTED_ADDRESSES[address]}` : graphqlProp;
    query += `
    ${prop}: adventurers(first: 50, orderBy: ${graphqlProp}, orderDirection: desc${whereClause}) {
      id
      address
      tokenId
      owner
      archetype
      level
      xp
      battles
      battleWins
      battleLosses
      wins
      animaEarned
      xpEarned
      winStreak
      upsetWins
      biggestAnimaWin
      homagePaid
    }\n`;
  });
  return query;
}
