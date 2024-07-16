import { Client as DiscordClient } from 'discord.js';
import { State } from '../types/State.js';

import { setChannelsCommand, getChannelsCommand } from '../commands/channel.js';
import showLeaderboardCommand from '../commands/showleaderboard.js';
import { startMonitorCommand, stopMonitorCommand } from '../commands/monitor.js';

export default function (client: DiscordClient, state: State) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
  
    const { commandName } = interaction;
  
    switch (commandName) {
      case 'setchannels':
        await setChannelsCommand.execute(interaction, state);
        break;
      case 'getchannels':
        await getChannelsCommand.execute(interaction, state);
        break;
      case 'showleaderboard':
        await showLeaderboardCommand.execute(interaction, state);
        break;
      case 'startmonitor':
        await startMonitorCommand.execute(interaction, state);
        break;
      case 'stopmonitor':
        await stopMonitorCommand.execute(interaction, state);
        break;      
    }
  });
}