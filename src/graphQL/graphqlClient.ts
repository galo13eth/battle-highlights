import { GraphQLClient } from 'graphql-request';

const createGraphQLClient = () => {
  if (!process.env.REALM_LEADERBOARD_SUBGRAPH) {
    throw new Error('REALM_LEADERBOARD_SUBGRAPH environment variable is not set');
  }
  console.log(`Creating graphql client with url`, process.env.REALM_LEADERBOARD_SUBGRAPH);
  return new GraphQLClient(process.env.REALM_LEADERBOARD_SUBGRAPH);
};

export default createGraphQLClient;