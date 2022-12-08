import { Client, Colors } from "discord.js";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);

import { createCommand } from "../core";
import { HeraServerInfo, HeraService } from "../services";
import { createDefaultEmbed, errorEmbed } from "../utils";

function createServerEmbed(server: HeraServerInfo) {
  const now = dayjs();
  const roundStarted = dayjs(server.roundStartedAt);
  const duration = dayjs.duration(now.diff(roundStarted)).humanize();

  return createDefaultEmbed()
    .setColor(Colors.Green)
    .setTitle(server.name)
    .setTimestamp(new Date(server.lastOnline))
    .setFooter({ text: "Last update" })
    .setImage(
      `https://s3.bf3reality.com/assets/loadingscreens/${server.roundLevelName.toLowerCase()}.png`
    )
    .setFields(
      {
        name: "Status",
        value: server.roundState,
      },
      {
        name: "Players",
        value: `${server.roundPlayers}/80`,
        inline: true,
      },
      // { name: "Health", value: `${server.health} FPS`, inline: true },
      { name: "Current Map", value: server.roundLevelName, inline: true },
      { name: "Round Duration", value: duration, inline: true },
      { name: "Join", value: `<vu://join/${server.id}>` }
      // { name: "Uptime", value: `${server.activeTime}`, inline: true }
    );
}

export default createCommand(
  "serverlist",
  (builder) =>
    builder
      .setDescription("Receive server info of Reality Mod servers")
      .addStringOption((option) =>
        option.setName("name").setDescription("Server name")
      ),
  async (interaction) => {
    const heraService = HeraService.getInstance();

    await interaction.deferReply();

    const servers = await heraService.getServers();

    if (!servers.length) {
      await interaction.editReply({
        embeds: [errorEmbed("No servers found.")],
      });
      return;
    }

    const amountOfServers = servers.length;
    // Sort servers by player count and make sure we only display 5
    servers.sort((a, b) => a.roundPlayers - b.roundPlayers);
    servers.length = Math.min(servers.length, 5);

    const embeds = servers.map(createServerEmbed);

    await interaction.editReply({
      embeds: embeds,
      content: `Found ${amountOfServers} servers, displaying top ${servers.length} by players.`,
    });
  }
);
