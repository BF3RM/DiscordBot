import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  ContextMenuCommandType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";

export type ConfiguredSlashCommandBuilder =
  | SlashCommandBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export interface Command {
  commandName: string;
  onCommand(interaction: CommandInteraction): Promise<void>;
  onAutocomplete(interaction: AutocompleteInteraction): Promise<void>;

  toJSON():
    | RESTPostAPIChatInputApplicationCommandsJSONBody
    | RESTPostAPIContextMenuApplicationCommandsJSONBody;
}

export const createCommand = (
  commandName: string,
  configure: (builder: SlashCommandBuilder) => ConfiguredSlashCommandBuilder,
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>
): Command => ({
  commandName,
  onCommand: async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      await execute(interaction);
    } catch (err) {
      console.error(
        `[ContextMenuCommand] [${commandName}] An error has occurred`,
        err
      );
      if (interaction.deferred) {
        await interaction.editReply({ content: "An error has occurred" });
      } else {
        await interaction.reply({
          content: "An error has occurred",
          ephemeral: true,
        });
      }
    }
  },
  onAutocomplete: (interaction) =>
    autocomplete ? autocomplete(interaction) : interaction.respond([]),

  toJSON: () =>
    configure(new SlashCommandBuilder()).setName(commandName).toJSON(),
});

/**
 * Creates a configured {@link Command} to process context menu commands
 * @param commandName context menu command name
 * @param type context menu command type
 * @param execute callback to execute on invoke
 */
export const createContextMenuCommand = (
  commandName: string,
  type: ContextMenuCommandType,
  execute: (interaction: ContextMenuCommandInteraction) => Promise<void>
): Command => ({
  commandName,
  onCommand: async (interaction) => {
    if (!interaction.isContextMenuCommand()) return;

    try {
      await execute(interaction);
    } catch (err) {
      await interaction.reply({ content: "An error has occurred" });
      console.error(
        `[ContextMenuCommand] [${commandName}] An error has occurred`,
        err
      );
    }
  },
  onAutocomplete: () => {
    throw new Error("Not supported");
  },

  toJSON: () =>
    new ContextMenuCommandBuilder().setName(commandName).setType(type).toJSON(),
});

// import fs from "node:fs";
// import path from "node:path";
// import {
//   AutocompleteInteraction,
//   Collection,
//   SlashCommandBuilder,
//   ChatInputCommandInteraction,
// } from "discord.js";

// import { EsModule } from "./types";

// export const loadCommands = (): Collection<string, BaseCommand> => {
//   const commandsPath = path.join(__dirname, "..", "commands");
//   const commands = new Collection<string, BaseCommand>();

//   const commandFiles = fs
//     .readdirSync(commandsPath)
//     .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

//   for (const file of commandFiles) {
//     const { default: commandType } =
//       require(`${commandsPath}/${file}`) as EsModule<BaseCommand>;

//     const command = new commandType();

//     commands.set(command.name, command);
//   }

//   return commands;
// };

// export abstract class BaseCommand {
//   protected constructor(public readonly name: string) {}

//   public abstract configure(
//     builder: SlashCommandBuilder
//   ): ConfiguredSlashCommandBuilder;
//   public abstract execute(
//     interaction: ChatInputCommandInteraction
//   ): Promise<void>;

//   /**
//    * Allows one to autocomplete on a specific command
//    * The default implementation will respond with an empty array
//    * @param interaction the autocomplete interaction
//    */
//   public async autocomplete(
//     interaction: AutocompleteInteraction
//   ): Promise<void> {
//     interaction.respond([]);
//   }
// }
