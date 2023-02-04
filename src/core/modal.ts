import {
  ButtonInteraction,
  CommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
} from "discord.js";

export interface ModalHandler {
  prefix: string;
  handle(interaction: ModalSubmitInteraction): Promise<void>;
}

export interface Modal<Args extends any[] = []> extends ModalHandler {
  show(
    interaction: CommandInteraction | ButtonInteraction,
    ...args: Args
  ): Promise<void>;
}

export interface ModalDefinition<Args extends any[] = []> {
  prefix: string;
  build(
    builder: ModalBuilder,
    ...args: Args
  ): ModalBuilder | Promise<ModalBuilder>;
  handle(interaction: ModalSubmitInteraction, ...args: Args): Promise<void>;
}

export const getModalArguments = <Args extends string[]>(
  customId: string
): Args => {
  const args = customId.split("#");
  args.shift(); // Remove prefix
  return args as Args;
};

export const defineModal = <Args extends any[] = []>(
  definition: ModalDefinition<Args>
): Modal<Args> => {
  if (definition.prefix.includes("#")) {
    throw new Error("Prefix is not allowed to contain a #");
  }

  return {
    prefix: definition.prefix,
    handle: async (interaction: ModalSubmitInteraction) => {
      const args = getModalArguments<Args>(interaction.customId);

      try {
        await definition.handle(interaction, ...args);
      } catch (err) {
        console.error(
          `[Modal] [${definition.prefix}] An error has occurred`,
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
    show: async (
      interaction: CommandInteraction | ButtonInteraction,
      ...args: Args
    ) => {
      const customId = [definition.prefix, ...(args || [])].join("#");
      const modal = await definition.build(
        new ModalBuilder().setCustomId(customId),
        ...args
      );

      await interaction.showModal(modal);
    },
  };
};
