import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { State, areChannelsSet } from '../types/State.js';
import { startMonitoring, stopMonitoring } from '../services/monitor.js';

export const startMonitorCommand = {
  data: new SlashCommandBuilder()
    .setName('startmonitor')
    .setDescription('Start monitoring the leaderboards')
    .addIntegerOption(option => option
      .setName('interval')
      .setDescription('Monitoring interval in seconds. Default 60s.')),
  execute: async (interaction: CommandInteraction, state: State) => {
    if (!areChannelsSet(state)) {
      await interaction.reply('Please set the channels with the setchannels command first.');
      return;
    }
    const monitoringInterval = interaction.options.get('interval')?.value ? interaction.options.get('interval')?.value as number * 1000 : 60000;
    const alreadyMonitoring = startMonitoring(state, monitoringInterval as number);
    if (alreadyMonitoring) {
      await interaction.reply('Already monitoring...');
    }
    else {
      await interaction.reply('Started monitoring the leaderboards.');
    }
  },
};

export const stopMonitorCommand = {
  data: new SlashCommandBuilder()
    .setName('stopmonitor')
    .setDescription('Stop monitoring the leaderboards'),
  execute: async (interaction: CommandInteraction, state: State) => {
    stopMonitoring();
    await interaction.reply('Stopped monitoring the leaderboards.');
  },
};