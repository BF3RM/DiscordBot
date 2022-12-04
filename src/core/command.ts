import fs from "node:fs";
import path from "node:path";
import {
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

type CommandConstructor = new () => BaseCommand;

interface CommandModule {
  default: CommandConstructor;
}

export const loadCommands = (): Collection<string, BaseCommand> => {
  const commandsPath = path.join(__dirname, "..", "commands");
  const commands = new Collection<string, BaseCommand>();

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  for (const file of commandFiles) {
    const { default: commandType } =
      require(`${commandsPath}/${file}`) as CommandModule;

    const command = new commandType();

    commands.set(command.name, command);
  }

  return commands;
};

export type ConfiguredSlashCommandBuilder =
  | SlashCommandBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export abstract class BaseCommand {
  protected constructor(public readonly name: string) {}

  public abstract configure(
    builder: SlashCommandBuilder
  ): ConfiguredSlashCommandBuilder;
  public abstract execute(interaction: CommandInteraction): Promise<void>;
}
