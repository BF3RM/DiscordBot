import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
  Client,
  Colors,
} from "discord.js";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);

import { BaseCommand } from "../core";
import { HeraServerInfo, HeraService } from "../services";
import { createDefaultEmbed, errorEmbed } from "../utils";

export default class ServerInfoCommand extends BaseCommand {
  constructor() {
    super("serverlist");
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Receive server info of Reality Mod servers")
      .addStringOption((option) =>
        option.setName("name").setDescription("Server name")
      );
  }

  public async execute(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const heraService = HeraService.getInstance();

    const servers = await heraService.getServers();

    if (!servers.length) {
      await interaction.editReply({
        embeds: [errorEmbed(interaction.client, "No servers found.")],
      });
      return;
    }

    const amountOfServers = servers.length;
    // Sort servers by player count and make sure we only display 5
    servers.sort((a, b) => a.roundPlayers - b.roundPlayers);
    servers.length = Math.min(servers.length, 5);

    const embeds = servers.map((server) =>
      this.createServerEmbed(interaction.client, server)
    );

    await interaction.editReply({
      embeds: embeds,
      content: `Found ${amountOfServers} servers, displaying top ${servers.length} by players.`,
    });
  }

  private createServerEmbed(client: Client, server: HeraServerInfo) {
    const now = dayjs();
    const roundStarted = dayjs(server.roundStartedAt);
    const duration = dayjs.duration(now.diff(roundStarted)).humanize();

    return createDefaultEmbed(client)
      .setColor(Colors.Green)
      .setTitle(server.name)
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
        { name: "Round Duration", value: duration, inline: true }
        // { name: "Uptime", value: `${server.activeTime}`, inline: true }
      );
  }
}
