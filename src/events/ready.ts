import { State } from '../types/State.js';
import { sendMessage } from '../services/messaging.js';

export default function (state: State) {
  state.discordClient.once('ready', () => {
    console.log(`Logged in as ${state.discordClient.user?.tag}`);

    if (process.env.MAINTENANCE_CHANNEL_ID === undefined) {
      throw new Error('Please set the channels in .env file first.');
    }
    sendMessage(state.discordClient, process.env.MAINTENANCE_CHANNEL_ID, 'Bot is up and running!');
  });
}