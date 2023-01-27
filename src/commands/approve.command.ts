import { ApplicationCommandType } from "discord.js";

import { defineContextMenuCommand } from "../core";
import { SuggestionService } from "../services";
import { errorEmbed, interactionMemberHasRole } from "../utils";

import { ApproveSuggestionModal } from "../modals";
import { SuggestionStatus } from "../entities";
import { getManagementRoleId } from "../config";

export default defineContextMenuCommand({
  name: "Approve suggestion",
  type: ApplicationCommandType.Message,

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    if (!interactionMemberHasRole(interaction, getManagementRoleId())) {
      await interaction.reply({
        embeds: [errorEmbed("You don't have permission to deny suggestions!")],
        ephemeral: true,
      });
      return;
    }

    const suggestionService = await SuggestionService.getInstance();

    const suggestion = await suggestionService.findByMessageId(
      interaction.targetMessage.id
    );

    if (!suggestion) {
      await interaction.reply({
        embeds: [errorEmbed("Failed to find suggestion")],
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
