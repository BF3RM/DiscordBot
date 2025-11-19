import { ButtonStyle, MessageFlags } from "discord.js";

import { defineButton } from "../core";
import { EditSuggestionModal } from "../modals";
import { SuggestionService } from "../services";
import { errorEmbed } from "../utils";

export default defineButton({
  prefix: "editSuggestion",
  label: "Edit",
  style: ButtonStyle.Primary,

  async handle(interaction) {
    const suggestionService = await SuggestionService.getInstance();

    const suggestion = await suggestionService.findByMessageId(
      interaction.message.id
    );

    if (!suggestion) {
      await interaction.reply({
        embeds: [errorEmbed("Failed to find suggestion")],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (suggestion.suggestedBy !== interaction.user.id) {
      await interaction.reply({
        embeds: [errorEmbed("You are not allowed to edit this suggestion!")],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await EditSuggestionModal.show(interaction, suggestion.id);
  },
});
