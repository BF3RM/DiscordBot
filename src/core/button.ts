import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";

export interface ButtonDefinition<Args extends any[] = []> {
  label: string;
  emoji?: string;
  style?: ButtonStyle;
  prefix: string;
  handle: (interaction: ButtonInteraction, ...args: Args) => Promise<void>;
}

export interface ButtonHandler {
  prefix: string;
  handle(interaction: ButtonInteraction): Promise<void>;
}

export interface Button<Args extends any[] = []> extends ButtonHandler {
  create(...args: Args): ButtonBuilder;
}

export const getCommandArguments = <Args extends string[]>(
  customId: string
) => {
  const args = customId.split("#");
  args.shift(); // Remove prefix
  return args as Args;
};

export const defineButton = <Args extends any[] = []>(
  definition: ButtonDefinition<Args>
): Button => {
  if (definition.prefix.includes("#")) {
    throw new Error("Prefix is not allowed to contain a #");
  }

  return {
    prefix: definition.prefix,
    create: (...args: Args) => {
      const customId = [definition.prefix, ...(args || [])].join("#");
      const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(definition.label)
        .setStyle(definition.style || ButtonStyle.Primary);

      if (definition.emoji) {
        button.setEmoji(definition.emoji);
      }

      return button;
    },
    handle: async (interaction: ButtonInteraction) => {
      const args = getCommandArguments<Args>(interaction.customId);

      try {
        await definition.handle(interaction, ...args);
      } catch (err) {
        console.error(
          `[ButtonHandler] [${definition.prefix}] An error has occurred`,
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
  };
};
