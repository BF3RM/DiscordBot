import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../core";

export default class DenyCommand extends BaseCommand {
  constructor() {
    super("deny", true);
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Denies a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Reason for denial")
          .setRequired(false)
      );
  }

  public execute(interaction: CommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
