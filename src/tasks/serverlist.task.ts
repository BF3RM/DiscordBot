import { Colors, Message } from "discord.js";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);

import { HeraServerInfo, HeraService, ScheduleJob } from "../services";
import { createDefaultEmbed, fetchTextChannel } from "../utils";
import { getServerListChannelId } from "../config";
import { getClientInstance } from "../core";
import { LoggerFactory } from "../logger.factory";

const logger = LoggerFactory.getLogger("ServerListJob");

function createServerEmbed(server: HeraServerInfo) {
  const now = dayjs();
  const roundStarted = dayjs(server.roundStartedAt);
  const duration = dayjs.duration(now.diff(roundStarted)).humanize();

  return createDefaultEmbed()
    .setColor(Colors.Green)
    .setTitle(server.name)
    .setFooter({ text: "Last updated" })
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

export class ServerListJob implements ScheduleJob {
  private message: Message | null = null;

  async execute() {
    const heraService = HeraService.getInstance();

    const servers = await heraService.getServers();

    if (!servers.length) {
      logger.warn("No servers where found");
      return;
    }

    // Sort servers by player count and make sure we only display 5
    servers.sort((a, b) => a.roundPlayers - b.roundPlayers);
    // servers.length = Math.min(servers.length, 5);

    const embeds = servers.map(createServerEmbed);

    if (this.message) {
      await this.message.edit({ embeds });
    } else {
      const serverChannel = await fetchTextChannel(
        getClientInstance(),
        getServerListChannelId()
      );

      this.message = await serverChannel.send({ embeds });
    }

    logger.debug("Updated server list");
  }
}
