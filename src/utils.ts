import { Client, EmbedBuilder } from "discord.js";

export const getSafeNumber = (val: string): number | undefined => {
  const number = +val;
  return !isNaN(number) ? number : undefined;
};

export const fetchChannelMessage = async (
  client: Client,
  channelId: string,
  messageId: string
) => {
  const channel = await client.channels.fetch(channelId);
  if (!channel) return;

  if (!channel.isDMBased() && channel.isTextBased()) {
    return channel.messages.fetch(messageId);
  }
};

export const createDefaultEmbed = (client: Client) =>
  new EmbedBuilder()
    .setColor("#276fff")
    .setTimestamp()
    .setFooter({
      text: client.user?.username || "RealityMod",
      iconURL: client.user?.displayAvatarURL(),
    });

export const errorEmbed = (client: Client, msg: string) =>
  createDefaultEmbed(client)
    .setColor("Red")
    .addFields({ name: "Error", value: msg });

export const infoEmbed = (client: Client, msg: string) =>
  createDefaultEmbed(client)
    .setColor("Blue")
    .addFields({ name: "Information", value: msg });

export const successEmbed = (client: Client, msg: string) =>
  createDefaultEmbed(client)
    .setColor("Green")
    .addFields({ name: "Success", value: msg });
