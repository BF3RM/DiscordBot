import {
  AutocompleteInteraction,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { BaseCommand } from "../core";

export default class EditCommand extends BaseCommand {
  constructor() {
    super("edit", true);
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Edits a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setAutocomplete(true)
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

  public async executeAutocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const focusedValue = interaction.options.getFocused();

    const choices = [
      { name: "Add loading music", value: 1 },
      { name: "Gib me moar kits", value: 50 },
      { name: "Fix crashes", value: 51 },
    ];
    const filtered = choices.filter((choice) =>
      choice.name.startsWith(focusedValue)
    );

    return interaction.respond(
      filtered.map((choice) => ({
        name: `#${choice.value}: ${choice.name}`,
        value: choice.value,
      }))
    );
  }
}
