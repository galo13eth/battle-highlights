import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, APIApplicationCommandOptionChoice } from 'discord.js';
import { State, areChannelsSet } from '../types/State.js';
import { LEADERBOARDS } from '../types/Leaderboard.js';
import { fetchSingleLeaderboardData } from '../graphQL/leaderboard.js';
import { createEmbedLeaderboardMessages } from '../services/leaderboard.js';
import { sendPaginatedEmbeds } from '../services/messaging.js';
import { ADDRESSES, INVERTED_ADDRESSES } from '../config/addresses.js';

const showleaderboardCommand = {
  data: new SlashCommandBuilder()
    .setName('showleaderboard')
    .setDescription('See the leaderboards')
    .addStringOption(option => 
      option.setName('leaderboard')
        .setDescription('Select a leaderboard')
        .setRequired(true)
        .addChoices(
          ...LEADERBOARDS.map(leaderboard => ({
            name: leaderboard.name, 
            value: leaderboard.graphqlProp
          }))
        )
    )
    .addStringOption(option => 
      option.setName('type')
        .setDescription('Select leaderboard type')
        .setRequired(true)
        .addChoices(
          { name: 'General', value: 'general' },
          { name: 'Smol', value: ADDRESSES.Smol },
          { name: 'Tales Heroes', value: ADDRESSES.TalesHero }
        )
    ),
  execute: async (interaction: CommandInteraction, state: State) => {
    if (!areChannelsSet(state)) {
      await interaction.reply('Please set the channels with the setchannels command first.');
      return;
    }
    const leaderboardGraphqlProp = interaction.options.get('leaderboard')?.value as (APIApplicationCommandOptionChoice['value']);
    const leaderboardTypeAddress = interaction.options.get('type')?.value as (APIApplicationCommandOptionChoice['value']);
    
    if (leaderboardGraphqlProp) {
      
      const data = await fetchSingleLeaderboardData(state, leaderboardGraphqlProp as string, leaderboardTypeAddress as string);
      const embeds = await createEmbedLeaderboardMessages(data, leaderboardGraphqlProp as string, INVERTED_ADDRESSES[leaderboardTypeAddress] as string, 10);
      await interaction.reply('Leaderboard loading...');
      await sendPaginatedEmbeds(state.discordClient, state.channels.general, embeds);

    } else {
      await interaction.reply('No leaderboard has been selected.');
    }
  },
};
export default showleaderboardCommand;