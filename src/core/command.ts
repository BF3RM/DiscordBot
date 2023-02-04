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

export interface CommandDefinition {
  name: string;
  configure: (builder: SlashCommandBuilder) => ConfiguredSlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface ContextMenuCommandDefinition {
  name: string;
  type: ContextMenuCommandType;
  execute: (interaction: ContextMenuCommandInteraction) => Promise<void>;
}

export const defineCommand = ({
  name,
  configure,
  execute,
  autocomplete,
}: CommandDefinition): Command => ({
  commandName: name,
  onCommand: async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      await execute(interaction);
    } catch (err) {
      console.error(`[Command] [${name}] An error has occurred`, err);
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

  toJSON: () => configure(new SlashCommandBuilder()).setName(name).toJSON(),
});

/**
 * Creates a configured {@link Command} to process context menu commands
 * @param commandName context menu command name
 * @param type context menu command type
 * @param execute callback to execute on invoke
 */
export const defineContextMenuCommand = ({
  name,
  type,
  execute,
}: ContextMenuCommandDefinition): Command => ({
  commandName: name,
  onCommand: async (interaction) => {
    if (!interaction.isContextMenuCommand()) return;

    try {
      await execute(interaction);
    } catch (err) {
      await interaction.reply({ content: "An error has occurred" });
      console.error(
        `[ContextMenuCommand] [${name}] An error has occurred`,
        err
      );
    }
  },
  onAutocomplete: () => {
    throw new Error("Not supported");
  },

  toJSON: () =>
    new ContextMenuCommandBuilder().setName(name).setType(type).toJSON(),
});
