import {
  ActivityType,
  Client,
  Collection,
  DiscordAPIError,
  Guild,
  Interaction,
  REST,
  Routes,
} from "discord.js";
import { getBotToken } from "../config";
import { runMigrations } from "../services";

import { ButtonHandler } from "./button";
import { getClientInstance } from "./client";
import { Command } from "./command";
import { loadCommands, loadButtonHandlers, loadModalHandlers } from "./loaders";
import { ModalHandler } from "./modal";

export class Bot {
  private client: Client;
  private commands: Collection<string, Command>;
  private buttonHandlers: Collection<string, ButtonHandler>;
  private modalHandlers: Collection<string, ModalHandler>;

  constructor() {
    this.client = getClientInstance();

    this.commands = loadCommands();
    console.log(`[Bot] Loaded ${this.commands.size} commands`);

    this.buttonHandlers = loadButtonHandlers();
    console.log(`[Bot] Loaded ${this.buttonHandlers.size} button handlers`);

    this.modalHandlers = loadModalHandlers();
    console.log(`[Bot] Loaded ${this.modalHandlers.size} modal handlers`);
  }

  public async start() {
    console.log("[Bot] Starting...");

    await runMigrations();

    this.client.on("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
    this.client.on("guildCreate", this.onGuildCreate.bind(this));

    return this.client.login(getBotToken());
  }

  private async onReady() {
    console.log(`[Bot] We are ready!`);
    await this.registerCommands();
    await this.client.user?.setActivity("Dreaming about working code", {
      type: ActivityType.Playing,
    });
  }

  private async onGuildCreate(guild: Guild) {
    await this.registerGuildCommands(guild.id);
    console.log(`[Bot] Joined ${guild.name} and registered commands`);
  }

  private async onInteractionCreate(interaction: Interaction) {
    if (interaction.isButton()) {
      const prefix = interaction.customId.split("#").shift();
      if (!prefix) {
        console.error("[Bot] Received button interaction without custom id");
        return;
      }

      const handler = this.buttonHandlers.get(prefix);
      if (!handler) return;
      await handler.handle(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      const prefix = interaction.customId.split("#").shift();
      if (!prefix) {
        console.error(
          "[Bot] Received modal submit interaction without custom id"
        );
        return;
      }

      const handler = this.modalHandlers.get(prefix);
      if (!handler) return;
      await handler.handle(interaction);
      return;
    }

    if (interaction.isCommand() || interaction.isAutocomplete()) {
      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      if (interaction.isCommand()) {
        await command.onCommand(interaction);
      } else {
        await command.onAutocomplete(interaction);
      }
    }
  }

  private async registerCommands() {
    for (const guild of this.client.guilds.cache.values()) {
      await this.registerGuildCommands(guild.id);
    }
    console.log(`[Bot] Registered slash commands on all known guilds`);
  }

  private async registerGuildCommands(guildId: string) {
    if (!this.client.user) {
      throw new Error(
        `Bot is not logged in, can't register guild commands on guild (${guildId})`
      );
    }

    try {
      const rest = new REST({ version: "10" }).setToken(getBotToken());

      const commandData = this.commands.map((command) => command.toJSON());

      await rest.put(
        Routes.applicationGuildCommands(this.client.user.id, guildId),
        { body: commandData }
      );
    } catch (error) {
      if (error instanceof DiscordAPIError && "code" in error.rawError) {
        if (error.rawError.code === 50001) {
          throw new Error(
            `Missing the "application.commands" permission on guild (${guildId})`
          );
        }
      }

      throw error;
    }
  }
}
