// util/deployCommands.ts
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';
import type { ApplicationCommandData } from 'discord.js';

dotenv.config();

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN || '');

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error('DISCORD_BOT_TOKEN is not defined');
}

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // for guild-based commands
    rest.put(Routes.applicationGuildCommands(process.env.DISCORD_APP_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), { body: [] })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);

    // for global commands
    rest.put(Routes.applicationCommands(process.env.DISCORD_APP_CLIENT_ID!), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
