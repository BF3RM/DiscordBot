import {
  ActivityType,
  Client,
  Collection,
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

import { BaseCommand, loadCommands } from "./command";

export class Bot {
  private client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
  });

  private commands: Collection<string, BaseCommand>;

  constructor() {
    this.commands = loadCommands();
    console.log(`[Bot] Loaded ${this.commands.size} commands`);
  }

  public start() {
    console.log("[Bot] Starting...");

    this.client.on("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
    this.client.on("guildCreate", this.onGuildCreate.bind(this));

    this.client.login(getBotToken());
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
    if (!interaction.isCommand() && !interaction.isAutocomplete()) {
      console.log("Yo who the fuck are you?", interaction);
      return;
    }

    const command = this.commands.get(interaction.commandName);

    try {
      if (interaction.isCommand()) {
        if (!command) {
          console.warn(
            `[Bot] Received interaction for unsupported command: "${interaction.commandName}", channel "${interaction.channel?.id}" by ${interaction.user.tag}`
          );
          interaction.followUp({ content: "An error has occurred" });
          return;
        }
        await interaction.deferReply({ ephemeral: command.isEphemeral });
        await command.execute(interaction);
      } else if (interaction.isAutocomplete()) {
        if (!command) return;
        await command.autocomplete(interaction);
      }
    } catch (err) {
      console.error(
        `${(err as Error).message}: "${interaction.commandName}", channel "${
          interaction.channel?.id
        }" by ${interaction.user.tag}`
      );
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

      const commandData = this.commands.map((command) =>
        command
          .configure(new SlashCommandBuilder().setName(command.name))
          .toJSON()
      );

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
