import { Colors, Message, TextChannel } from "discord.js";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);

import {
  HeraServerInfo,
  HeraService,
  InitializableScheduleJob,
} from "../services";
import { createDefaultEmbed, fetchTextChannel } from "../utils";
import { getServerListChannelId } from "../config";
import { getClientInstance } from "../core";
import { LoggerFactory } from "../logger.factory";

const logger = LoggerFactory.getLogger("ServerListJob");

const MAPS = new Map<string, string>([
  ["MP_001", "Grand Bazaar"],
  ["MP_003", "Teheran Highway"],
  ["MP_007", "Caspian Border"],
  ["MP_011", "Seine Crossing"],
  ["MP_012", "Operation Firestorm"],
  ["MP_013", "Damavand Peak"],
  ["MP_017", "Noshahr Canals"],
  ["MP_018", "Kharg Island"],
  ["MP_Subway", "Operation Metro"],
  ["XP1_001", "Karkand"],
  ["XP1_002", "Gulf of Oman"],
  ["XP1_003", "Sharqi Peninsula"],
  ["XP1_004", "Wake Island"],
  ["XP2_Palace", "Donya Fortress"],
  ["XP2_Office", "Operation 925"],
  ["XP2_Factory", "Scrapmetal"],
  ["XP2_Skybar", "Ziba Tower"],
  ["XP3_Alborz", "Alborz Mountains"],
  ["XP3_Shield", "Issue 226"],
  ["XP3_Desert", "Bandar Desert"],
  ["XP3_Valley", "Death Valley"],
  ["XP4_Parl", "Azadi Palace"],
  ["XP4_Quake", "Epicenter"],
  ["XP4_FD", "Markaz Monolith"],
  ["XP4_Rubble", "Talah Market"],
  ["XP5_001", "Riverside"],
  ["XP5_002", "Nebandan Flats"],
  ["XP5_003", "OP Lumberman"],
  ["XP5_004", "Sabalan Pipeline"],
]);

const GAMEMODES = new Map<string, string>([
  ["AdvanceAndSecureStd", "AAS Standard"],
  ["AdvanceAndSecureAlt", "AAS Alternative"],
  ["SkirmishStd", "Skirmish Standard"],
  ["SkirmishAlt", "Skirmish Alternative"],
]);

function createServerEmbed(server: HeraServerInfo) {
  const now = dayjs();
  const roundStarted = dayjs(server.roundStartedAt);
  const duration = dayjs.duration(now.diff(roundStarted)).humanize();

  const levelName = server.roundLevelName.substring(
    server.roundLevelName.lastIndexOf("/") + 1
  );

  return createDefaultEmbed()
    .setColor(Colors.Green)
    .setTitle(server.name)
    .setFooter({ text: "Last updated" })
    .setImage(
      `https://s3.bf3reality.com/assets/loadingscreens/${levelName.toLowerCase()}.png`
    )
    .setFields(
      { name: "Map", value: MAPS.get(levelName) ?? levelName, inline: true },
      {
        name: "Players",
        value: `${server.roundPlayers}/${server.roundMaxPlayers}`,
        inline: true,
      },
      {
        name: " ",
        value: " ",
      },
      {
        name: "Gamemode",
        value: GAMEMODES.get(server.roundGameMode) ?? server.roundGameMode,
        inline: true,
      },
      { name: "Round Duration", value: duration, inline: true },

      {
        name: " ",
        value: `**[Join Server](https://play.bf3reality.com/join/${server.id})**`,
      }
    );
}

export class ServerListJob implements InitializableScheduleJob {
  private channel: TextChannel | undefined;
  private message: Message | undefined;

  async init() {
    const client = getClientInstance();

    this.channel = await fetchTextChannel(client, getServerListChannelId());

    if (!this.channel) {
      throw new Error("Failed to find server list channel");
    }

    this.message = this.channel.messages.cache.find(
      (message) => message.author.id === client.user?.id
    );

    if (this.message) {
      logger.info(`Found existing server list message (${this.message.id}})`);
    }

    await this.sendServerList();
  }

  async execute() {
    await this.sendServerList();
    logger.debug("Updated server list");
  }

  private async sendServerList() {
    const heraService = HeraService.getInstance();

    const servers = await heraService.getServers();

    if (!servers.length) {
      logger.warn("No servers where found");
      return;
    }

    // Sort servers by player count and make sure we only display 5
    servers.sort((a, b) => b.roundPlayers - a.roundPlayers);
    // servers.length = Math.min(servers.length, 5);

    const embeds = servers.map(createServerEmbed);

    if (this.message) {
      await this.message.edit({ embeds });
    } else {
      this.message = await this.channel!.send({ embeds });
    }
  }
}
