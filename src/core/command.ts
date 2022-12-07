import fs from "node:fs";
import path from "node:path";
import {
  AutocompleteInteraction,
  Collection,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

import { EsModule } from "./types";

export const loadCommands = (): Collection<string, BaseCommand> => {
  const commandsPath = path.join(__dirname, "..", "commands");
  const commands = new Collection<string, BaseCommand>();

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  for (const file of commandFiles) {
    const { default: commandType } =
      require(`${commandsPath}/${file}`) as EsModule<BaseCommand>;

    const command = new commandType();

    commands.set(command.name, command);
  }

  return commands;
};

export type ConfiguredSlashCommandBuilder =
  | SlashCommandBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export abstract class BaseCommand {
  protected constructor(
    public readonly name: string,
    public readonly isEphemeral = false
  ) {}

  public abstract configure(
    builder: SlashCommandBuilder
  ): ConfiguredSlashCommandBuilder;
  public abstract execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;

  /**
   * Allows one to autocomplete on a specific command
   * The default implementation will respond with an empty array
   * @param interaction the autocomplete interaction
   */
  public async autocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    interaction.respond([]);
  }
}
