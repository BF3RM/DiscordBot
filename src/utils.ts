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

export const createDefaultEmbed = () =>
  new EmbedBuilder().setColor("#276fff").setTimestamp();

export const errorEmbed = (msg: string) =>
  createDefaultEmbed().setColor("Red").addFields({ name: "Error", value: msg });

export const infoEmbed = (msg: string) =>
  createDefaultEmbed()
    .setColor("Blue")
    .addFields({ name: "Information", value: msg });

export const successEmbed = (msg: string) =>
  createDefaultEmbed()
    .setColor("Green")
    .addFields({ name: "Success", value: msg });
