import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { defineModal } from "../core";
import { successEmbed } from "../utils";

export default defineModal({
  prefix: "denySuggestion",
  build(builder, suggestionId: number) {
    return builder
      .setTitle(`Deny #${suggestionId}?`)
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
    await interaction.reply({
      embeds: [successEmbed("Suggestion denied")],
      ephemeral: true,
    });
  },
});
