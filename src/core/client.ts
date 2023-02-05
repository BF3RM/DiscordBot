import { Client, GatewayIntentBits, Partials } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildScheduledEvents],
  partials: [Partials.Channel],
});

export const getClientInstance = () => client;