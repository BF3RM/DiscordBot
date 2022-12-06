import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../core";

export default class ImplementedCommand extends BaseCommand {
  constructor() {
    super("implemented", true);
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Implements a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setRequired(true)
      );
  }

  public execute(interaction: ChatInputCommandInteraction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}