import {
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  EmbedBuilder,
  Colors,
} from "discord.js";

import { defineModal } from "../core";
import { SuggestionService } from "../services";

export default defineModal({
  prefix: "editSuggestionModal",
  async build(builder, suggestionId: number) {
    const suggestionService = await SuggestionService.getInstance();

    const suggestion = await suggestionService.findById(suggestionId);
    if (!suggestion) {
      throw new Error("Failed to find suggestion");
    }

    const titleText = new TextInputBuilder()
      .setCustomId("titleInput")
      .setLabel("Title")
      .setStyle(TextInputStyle.Short)
      .setValue(suggestion.title)
      .setRequired(true);

    const descriptionText = new TextInputBuilder()
      .setLabel("Description")
      .setCustomId("descriptionInput")
      .setStyle(TextInputStyle.Paragraph)
      .setValue(suggestion.description)
      .setRequired(true);

    const firstRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        titleText
      );
    const secondRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        descriptionText
      );

    return builder
      .setTitle(`Edit suggestion #${suggestionId}`)
      .addComponents(firstRow, secondRow);
  },
  async handle(interaction, suggestionId: number) {
    if (!interaction.inGuild()) return;

    const suggestionService = await SuggestionService.getInstance();

    await interaction.deferReply({ ephemeral: true });

    const { message } = await suggestionService.update(suggestionId, {
      title: interaction.fields.getTextInputValue("titleInput"),
      description: interaction.fields.getTextInputValue("descriptionInput"),
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle("Suggestion was edited")
          .setDescription(
            `[Click here to view the suggestion](${message.url})`
          ),
      ],
    });
  },
});
