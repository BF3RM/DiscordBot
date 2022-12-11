import { ButtonInteraction } from "discord.js";

export interface ButtonHandler {
  prefix: string;
  handle(interaction: ButtonInteraction): Promise<void>;
}

export const getCommandArguments = (customId: string) => {
  const args = customId.split("#");
  args.shift(); // Remove prefix
  return args;
};

export const createButtonHandler = (
  prefix: string,
  handle: (interaction: ButtonInteraction, args: string[]) => Promise<void>
): ButtonHandler => {
  if (prefix.includes("#")) {
    throw new Error("Prefix is not allowed to contain a #");
  }

  return {
    prefix,
    handle: async (interaction: ButtonInteraction) => {
      const args = getCommandArguments(interaction.customId);

      try {
        await handle(interaction, args);
      } catch (err) {
        console.error(`[ButtonHandler] [${prefix}] An error has occurred`, err);
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
