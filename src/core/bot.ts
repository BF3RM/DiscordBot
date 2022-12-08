import {
  ActivityType,
  ApplicationCommandType,
  Client,
  Collection,
  ContextMenuCommandBuilder,
  DiscordAPIError,
  GatewayIntentBits,
  Guild,
  Interaction,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { getBotToken } from "../config";
import { runMigrations } from "../services";
import { BaseButtonHandler, loadButtonHandlers } from "./button";

import { Command } from "./command";
import { loadCommands } from "./loaders";

export class Bot {
  private client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
  });

  private commands: Collection<string, Command>;
  private buttonHandlers: Collection<string, BaseButtonHandler>;

  constructor() {
    this.commands = loadCommands();
    console.log(`[Bot] Loaded ${this.commands.size} commands`);

    this.buttonHandlers = loadButtonHandlers();
    console.log(`[Bot] Loaded ${this.buttonHandlers.size} button handlers`);
  }

  public async start() {
    console.log("[Bot] Starting...");

    console.log("[Bot] Running database migrations");
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
      if (!handler) {
        console.warn(
          `[Bot] Received button interaction for unsupported prefix: ${prefix}`
        );
        await interaction.reply({
          content: "An error has occurred",
          ephemeral: true,
        });
        return;
      }

      try {
        await handler.handle(interaction);
      } catch (err) {
        await interaction.followUp({
          content: "An error has occurred",
          ephemeral: true,
        });
      }
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

    // try {
    //   if (interaction.isChatInputCommand()) {
    //     if (!command) {
    //       console.warn(
    //         `[Bot] Received interaction for unsupported command: "${interaction.commandName}", channel "${interaction.channel?.id}" by ${interaction.user.tag}`
    //       );
    //       interaction.followUp({ content: "An error has occurred" });
    //       return;
    //     }
    //     await command.execute(interaction);
    //   } else if (interaction.isAutocomplete()) {
    //     if (!command) return;
    //     await command.autocomplete(interaction);
    //   }
    // } catch (err) {
    //   console.error(
    //     `${(err as Error).message}: "${interaction.commandName}", channel "${
    //       interaction.channel?.id
    //     }" by ${interaction.user.tag}`
    //   );
    //   if (interaction.isCommand()) {
    //     await interaction.followUp({ content: "An error has occurred" });
    //   }
    // }
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

      // commandData.push(
      //   new ContextMenuCommandBuilder()
      //     .setName("Approve suggestion")
      //     .setType(ApplicationCommandType.Message)
      //     .toJSON() as any
      // );

      // commandData.push(
      //   new ContextMenuCommandBuilder()
      //     .setName("Deny suggestion")
      //     .setType(ApplicationCommandType.Message)
      //     .toJSON() as any
      // );

      // commandData.push(
      //   new ContextMenuCommandBuilder()
      //     .setName("Implement suggestion")
      //     .setType(ApplicationCommandType.Message)
      //     .toJSON() as any
      // );

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
