import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../core";

export default class ApproveCommand extends BaseCommand {
  constructor() {
    super("approve", true);
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Approves a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Reason for approval")
          .setRequired(false)
      );
  }

  public execute(interaction: ChatInputCommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
