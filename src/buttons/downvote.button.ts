import { EmbedBuilder } from "discord.js";

import { createButtonHandler } from "../core/button";
import { UserAlreadyVotedError, SuggestionEntityService } from "../services";
import { errorEmbed, fetchChannelMessage, successEmbed } from "../utils";

export default createButtonHandler(
  "downvoteSuggestion",
  async (interaction, args) => {
    const suggestionService = await SuggestionEntityService.getInstance();

    const suggestion = await suggestionService.findById(parseInt(args[0]));
    if (!suggestion) {
      await interaction.followUp({
        embeds: [errorEmbed("Failed to find suggestion")],
        ephemeral: true,
      });
      return;
    }

    const originalMessage = await fetchChannelMessage(
      interaction.client,
      suggestion.channelId,
      suggestion.messageId!
    );

    if (!originalMessage) {
      await interaction.reply({
        embeds: [errorEmbed("Failed to find original suggestion")],
        ephemeral: true,
      });
      return;
    }

    try {
      const updatedSuggestion = await suggestionService.addUserDownvote(
        suggestion.id,
        interaction.user
      );

      const suggestionEmbed = EmbedBuilder.from(originalMessage.embeds[0]);

      suggestionEmbed.setFields({
        name: "Votes",
        value: suggestionService.generateVotesText(updatedSuggestion),
      });

      await originalMessage.edit({ embeds: [suggestionEmbed] });

      await interaction.reply({
        embeds: [successEmbed("Downvoted suggestion")],
        ephemeral: true,
      });
    } catch (err) {
      if (err instanceof UserAlreadyVotedError) {
        await interaction.reply({
          embeds: [errorEmbed(`You have already downvoted this suggestion`)],
          ephemeral: true,
        });
      }
    }
  }
);
