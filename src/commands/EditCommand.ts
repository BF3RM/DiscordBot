import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../core";

export default class EditCommand extends BaseCommand {
  constructor() {
    super("edit");
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Edits a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("The new message")
          .setRequired(true)
      )
      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription("The new image")
          .setRequired(false)
      );
  }

  public execute(interaction: CommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
