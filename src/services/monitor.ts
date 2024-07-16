import { State } from '../types/State.js';
import { LEADERBOARDS } from '../types/Leaderboard.js';
import { fetchAllLeaderboardsData } from '../graphQL/leaderboard.js';
import { sendEmbed } from './messaging.js';
import { Adventurer } from '../types/Adventurer.js';
import { createEmbedForNewEntry, createEmbedForPositionChange, createEmbedForNewDropOut } from './leaderboard.js';
import { ADDRESSES, INVERTED_ADDRESSES } from '../config/addresses.js';
import { Leaderboard } from '../types/Leaderboard.js';

let currentLeaderboardsData: Map<string, Adventurer[]> = new Map();
let intervalId: NodeJS.Timeout | null = null;

export function startMonitoring(state: State, interval: number) {
  if (intervalId) {
    console.log('Monitoring is already running.');
    return true;
  }
  console.log('Starting monitoring...');

  const monitor = async () => {
    try {
      const newLeaderboardsData = await fetchAllLeaderboardsData(state);

      await Promise.all(LEADERBOARDS.map(leaderboard => 
        Promise.all([
          leaderboard.graphqlProp === 'winStreak' ? 
            (
              monitorWinStreakLeaderboard(leaderboard, state, newLeaderboardsData, leaderboard.graphqlProp),
              monitorWinStreakLeaderboard(leaderboard, state, newLeaderboardsData, `${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.Smol]}`, INVERTED_ADDRESSES[ADDRESSES.Smol]),
              monitorWinStreakLeaderboard(leaderboard, state, newLeaderboardsData, `${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.TalesHero]}`, INVERTED_ADDRESSES[ADDRESSES.TalesHero])
            ) :
            (
              monitorLeaderboard(leaderboard, state, newLeaderboardsData, leaderboard.graphqlProp),
              monitorLeaderboard(leaderboard, state, newLeaderboardsData, `${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.Smol]}`, INVERTED_ADDRESSES[ADDRESSES.Smol]),
              monitorLeaderboard(leaderboard, state, newLeaderboardsData, `${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.TalesHero]}`, INVERTED_ADDRESSES[ADDRESSES.TalesHero])
            ),           
          ])
      ));

      for (const leaderboard of LEADERBOARDS) {
        currentLeaderboardsData.set(leaderboard.graphqlProp, newLeaderboardsData[leaderboard.graphqlProp]);
        currentLeaderboardsData.set(`${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.Smol]}`, newLeaderboardsData[`${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.Smol]}`]);
        currentLeaderboardsData.set(`${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.TalesHero]}`, newLeaderboardsData[`${leaderboard.graphqlProp}_${INVERTED_ADDRESSES[ADDRESSES.TalesHero]}`]);
      }

    } catch (err) {
      console.error('Error while monitoring leaderboards:', err);
    }

    intervalId = setTimeout(monitor, interval);
  }

  monitor();
}

export function stopMonitoring() {
  if (intervalId) {
    clearTimeout(intervalId);
    intervalId = null;
    console.log('Stopped monitoring.');
  } else {
    console.log('No active monitoring to stop.');
  }
}

async function monitorLeaderboard(leaderboard: Leaderboard, state: State, newLeaderboardsData: Record<string, Adventurer[]>, prop: string, type?: string) {
  const newLeaderboardData = newLeaderboardsData[prop];
  
  if (currentLeaderboardsData.has(prop)) {
    const currentLeaderboardData = currentLeaderboardsData.get(prop);
    const newEntries = newLeaderboardData.filter(newEntry => !currentLeaderboardData?.some(currentEntry => currentEntry.id === newEntry.id));
    
    if (newEntries.length > 0) {
      for (const newEntry of newEntries) {
        const newRanking = newLeaderboardData.findIndex(entry => entry.id === newEntry.id);
        const { embedMessage, attachments } = await createEmbedForNewEntry(newEntry, leaderboard, newRanking, type);

        // Send to general channel and top10 channel if applicable
        await sendEmbed(state.discordClient, state.channels.general, embedMessage, attachments);
        if (newRanking < 10) {
          await sendEmbed(state.discordClient, state.channels.top10, embedMessage, attachments);
        }
      }
    }

    const movedEntries = newLeaderboardData.filter(newEntry => currentLeaderboardData?.some(currentEntry => currentEntry.id === newEntry.id));
    for (const movedEntry of movedEntries) {
      const oldIndex = currentLeaderboardData?.findIndex(entry => entry.id === movedEntry.id);
      const newIndex = newLeaderboardData.findIndex(entry => entry.id === movedEntry.id);
      if (oldIndex && oldIndex > newIndex) {
        const { embedMessage, attachments } = await createEmbedForPositionChange(movedEntry, leaderboard, oldIndex, newIndex, type);
        
        // Send to general channel and top10 channel if applicable
        await sendEmbed(state.discordClient, state.channels.general, embedMessage, attachments);
        if (newIndex < 10) {
          await sendEmbed(state.discordClient, state.channels.top10, embedMessage, attachments);
        }
      }
    }
  }
}

async function monitorWinStreakLeaderboard(leaderboard: Leaderboard, state: State, newLeaderboardsData: Record<string, Adventurer[]>, prop: string, type?: string) {
  const newLeaderboardData = newLeaderboardsData[prop];
  const currentLeaderboardData = currentLeaderboardsData.get(prop);
  
  if (currentLeaderboardData) {
    const leftEntries = currentLeaderboardData.filter(currentEntry => !newLeaderboardData.some(newEntry => newEntry.id === currentEntry.id));
    
    if (leftEntries.length > 0) {
      for (const leftEntry of leftEntries) {
        const oldRanking = currentLeaderboardData.findIndex(entry => entry.id === leftEntry.id);
        const { embedMessage, attachments } = await createEmbedForNewDropOut(leftEntry, leaderboard, oldRanking, type);

        // Send to general channel and top10 channel if applicable
        await sendEmbed(state.discordClient, state.channels.general, embedMessage, attachments);
        if (oldRanking < 10) {
          await sendEmbed(state.discordClient, state.channels.top10, embedMessage, attachments);
        }
      }
    }
  }
}
