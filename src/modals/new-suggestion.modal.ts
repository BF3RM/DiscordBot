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
  prefix: "suggestionModal",
  build(builder) {
    const titleText = new TextInputBuilder()
      .setCustomId("titleInput")
      .setLabel("Title")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descriptionText = new TextInputBuilder()
      .setLabel("Description")
      .setCustomId("descriptionInput")
      .setStyle(TextInputStyle.Paragraph)
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
      .setTitle("New suggestion")
      .addComponents(firstRow, secondRow);
  },
  async handle(interaction) {
    if (!interaction.inGuild()) return;

    const suggestionService = await SuggestionService.getInstance();

    await interaction.deferReply({ ephemeral: true });

    const { message } = await suggestionService.create({
      authorId: interaction.user.id,
      title: interaction.fields.getTextInputValue("titleInput"),
      message: interaction.fields.getTextInputValue("descriptionInput"),
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle("Suggestion was created")
          .setDescription(
            `[Click here to view the suggestion](${message.url})`
          ),
      ],
    });
  },
});
