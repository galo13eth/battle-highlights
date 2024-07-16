import { Client as DiscordClient } from 'discord.js';
import { GraphQLClient } from 'graphql-request';

export interface State {
  channels: {
    general: string;
    top10: string;
  };
  discordClient: DiscordClient;
  graphqlClient: GraphQLClient;
  monitoring: boolean;
}

export function areChannelsSet(state: State): boolean {
  return !!state.channels.general && !!state.channels.top10;
}