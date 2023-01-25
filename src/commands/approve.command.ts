import { ApplicationCommandType } from "discord.js";

import { defineContextMenuCommand } from "../core";
import { SuggestionService } from "../services";
import { errorEmbed } from "../utils";

import ApproveSuggestionModal from "../modals/approve-suggestion.modal";
import { SuggestionStatus } from "../entities";

export default defineContextMenuCommand({
  name: "Approve suggestion",
  type: ApplicationCommandType.Message,

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const suggestionService = await SuggestionService.getInstance();

    const suggestion = await suggestionService.findByMessageId(
      interaction.targetMessage.id
    );

    if (!suggestion) {
      await interaction.reply({
        embeds: [errorEmbed("Suggestion not found")],
        ephemeral: true,
      });
      return;
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      await interaction.reply({
        embeds: [
          errorEmbed("Suggestion has already been approved or rejected!"),
        ],
        ephemeral: true,
      });
      return;
    }

    await ApproveSuggestionModal.show(interaction, suggestion.id);
  },
});
