import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../core";

export default class SuggestCommand extends BaseCommand {
  constructor() {
    super("suggest");
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Suggest something to be added to RM!")
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Suggestion Message")
          .setRequired(true)
      )
      .addAttachmentOption((option) =>
        option
          .setRequired(false)
          .setName("image")
          .setDescription("Suggestion Image")
      );
  }

  public execute(interaction: CommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
