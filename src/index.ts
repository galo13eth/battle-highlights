import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import createGraphQLClient from './graphQL/graphqlClient.js';
import { State } from './types/State';
import readyEvent from './events/ready.js';
import commandInteractionEvent from './events/commandInteraction.js';
import { startMonitoring } from './services/monitor.js';

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN;
const graphqlClient = createGraphQLClient();

const discordClient = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

if (process.env.GENERAL_CHANNEL_ID === undefined || process.env.TOP10_CHANNEL_ID === undefined) {
  throw new Error('Please set the channels in .env file first.');
}

const state: State = {
  channels: {
    general: process.env.GENERAL_CHANNEL_ID,
    top10: process.env.TOP10_CHANNEL_ID,
  },
  discordClient,
  graphqlClient,
  monitoring: false
};

readyEvent(state);
discordClient.login(token);

//commandInteractionEvent(discordClient, state);
const monitoringInterval = process.env.MONITORING_INTERVAL;
if (monitoringInterval) {
  startMonitoring(state, parseInt(monitoringInterval));
}
else {
  startMonitoring(state, 60000);
}