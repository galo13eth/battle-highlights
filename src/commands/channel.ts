import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, CommandInteraction } from 'discord.js';
import { State } from '../types/State.js';

export const getChannelsCommand = {
  data: new SlashCommandBuilder()
    .setName('getchannels')
    .setDescription('Get the current channels set to receive leaderboard reports'),
  execute: async (interaction: CommandInteraction, state: State) => {
    const generalChannel = interaction.guild?.channels.cache.get(state.channels.general);
    const top10Channel = interaction.guild?.channels.cache.get(state.channels.top10);
    if (generalChannel && top10Channel) {
      await interaction.reply(`The current channels to receive leaderboard reports are: ${generalChannel.name} for general and ${top10Channel.name} for top10.`);
    } else {
      await interaction.reply('No channels have been set to receive leaderboard reports.');
    }
  },
};

export const setChannelsCommand = {
  data: new SlashCommandBuilder()
    .setName('setchannels')
    .setDescription('Set the channels to receive leaderboard reports')
    .addChannelOption((option) =>
      option
        .setName('general')
        .setDescription('The channel to set to receive all leaderboard reports')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('top10')
        .setDescription('The channel to set to receive top10 leaderboard reports')
        .setRequired(true)
    ),
  execute: async (interaction: CommandInteraction, state: State) => {
    const generalChannel = interaction.options.resolved?.channels?.last() ?? null;
    const top10Channel = interaction.options.resolved?.channels?.first() ?? null;
    if (!generalChannel || (generalChannel.type !== ChannelType.GuildText && generalChannel.type !== ChannelType.GuildAnnouncement)) {
      await interaction.reply('Please select a text channel for general.');
      return false;
    }
    if (!top10Channel || (top10Channel.type !== ChannelType.GuildText && top10Channel.type !== ChannelType.GuildAnnouncement)) {
      await interaction.reply('Please select a text channel for top10.');
      return false;
    }

    state.channels.general = generalChannel.id;
    state.channels.top10 = top10Channel.id;
    await interaction.reply(`Channels set to: ${generalChannel.name} for general and ${top10Channel.name} for top10.`);
    return true;
  },
};