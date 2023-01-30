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
import { getBotToken, getServerListScheduleRule } from "./config";
import {
  Command,
  ButtonHandler,
  ModalHandler,
  getClientInstance,
  loadButtonHandlers,
  loadCommands,
  loadModalHandlers,
} from "./core";
import { LoggerFactory } from "./logger.factory";
import { runMigrations, SchedulerService } from "./services";
import { ServerListJob } from "./tasks";

const logger = LoggerFactory.getLogger("Bot");

export class Bot {
  private client: Client;
  private commands = new Collection<string, Command>();
  private buttonHandlers = new Collection<string, ButtonHandler>();
  private modalHandlers = new Collection<string, ModalHandler>();

  constructor() {
    this.client = getClientInstance();
  }

  public async start() {
    logger.info("Starting...");

    loadCommands(this.commands);
    logger.info(`Loaded ${this.commands.size} commands`);

    loadButtonHandlers(this.buttonHandlers);
    logger.info(`Loaded ${this.buttonHandlers.size} button handlers`);

    loadModalHandlers(this.modalHandlers);
    logger.info(`Loaded ${this.modalHandlers.size} modal handlers`);

    await runMigrations();

    this.client.on("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
    this.client.on("guildCreate", this.onGuildCreate.bind(this));

    return this.client.login(getBotToken());
  }

  private async onReady() {
    logger.info(`We are ready!`);
    await this.registerCommands();
    await this.client.user?.setActivity("Dreaming about working code", {
      type: ActivityType.Playing,
    });
    this.scheduleJobs();
  }

  private async onGuildCreate(guild: Guild) {
    await this.registerGuildCommands(guild.id);
    logger.info(`Joined ${guild.name} and registered commands`);
  }

  private async onInteractionCreate(interaction: Interaction) {
    if (interaction.isButton()) {
      const prefix = interaction.customId.split("#").shift();
      if (!prefix) {
        logger.error("Received button interaction without custom id");
        return;
      }

      const handler = this.buttonHandlers.get(prefix);
      if (!handler) {
        logger.warn({ prefix }, "No button handler for prefix");
        return;
      }
      await handler.handle(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      const prefix = interaction.customId.split("#").shift();
      if (!prefix) {
        logger.error("Received modal submit interaction without custom id");
        return;
      }

      const handler = this.modalHandlers.get(prefix);
      if (!handler) {
        logger.warn({ prefix }, "No modal handler for prefix");
        return;
      }
      await handler.handle(interaction);
      return;
    }

    if (interaction.isCommand() || interaction.isAutocomplete()) {
      const command = this.commands.get(interaction.commandName);
      if (!command) {
        logger.warn(
          { commandName: interaction.commandName },
          "Unknown command interaction"
        );
        return;
      }

      if (interaction.isCommand()) {
        await command.onCommand(interaction);
      } else {
        await command.onAutocomplete(interaction);
      }
      return;
    }

    logger.warn({ interaction }, "Received unknown interaction");
  }

  private async registerCommands() {
    for (const guild of this.client.guilds.cache.values()) {
      await this.registerGuildCommands(guild.id);
    }
    logger.info(`Registered slash commands on all known guilds`);
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

  private scheduleJobs() {
    SchedulerService.schedule(
      "ServerList",
      getServerListScheduleRule(),
      new ServerListJob()
    );
  }
}

process.on("uncaughtException", (err) => {
  logger.error(err);
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
});
