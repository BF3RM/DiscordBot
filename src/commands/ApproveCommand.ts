import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../core";

export default class ApproveCommand extends BaseCommand {
  constructor() {
    super("approve");
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

  public execute(interaction: CommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
