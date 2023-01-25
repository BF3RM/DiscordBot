import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { defineModal } from "../core";
import { SuggestionService } from "../services";
import { successEmbed } from "../utils";

export default defineModal({
  prefix: "approveSuggestion",
  build(builder, suggestionId: number) {
    return builder
      .setTitle(`Approve #${suggestionId}?`)
      .setComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("reasonInput")
            .setLabel("Reason")
            .setStyle(TextInputStyle.Paragraph)
        )
      );
  },
  async handle(interaction, suggestionId: number) {
    const suggestionService = await SuggestionService.getInstance();

    await interaction.deferReply({ ephemeral: true });

    await suggestionService.approve(
      suggestionId,
      interaction.user,
      interaction.fields.getTextInputValue("reasonInput")
    );

    await interaction.editReply({
      embeds: [successEmbed("Suggestion approved")],
    });
  },
});
