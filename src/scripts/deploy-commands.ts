// util/deployCommands.ts
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import dotenv from 'dotenv';
import type { ApplicationCommandData } from 'discord.js';

dotenv.config();

const commands: ApplicationCommandData[] = [];
const commandNames = new Set();
const commandFiles = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  console.log(file);
  const commandModule = await import(`../commands/${file}`);
  
  // Get all the command objects in the module
  for (const commandKey in commandModule) {
    if (Object.prototype.hasOwnProperty.call(commandModule, commandKey)) {
      const command = commandModule[commandKey];
      if (!commandNames.has(command.data.name)) {
        commandNames.add(command.data.name);
        commands.push(command.data.toJSON());
      }
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN || '');

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error('DISCORD_BOT_TOKEN is not defined');
}

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Deploy to a single guild (use in dev)
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_APP_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
      { body: commands }
    );

    // Deploy to all guilds
    /*await rest.put(
      Routes.applicationCommands(process.env.DISCORD_APP_CLIENT_ID!),
      { body: commands }
    );*/

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
