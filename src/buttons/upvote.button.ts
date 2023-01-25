import { Colors, EmbedBuilder } from "discord.js";

import { createButtonHandler } from "../core/button";
import {
  UserAlreadyVotedError,
  SuggestionService,
  SuggestionNotFoundError,
} from "../services";
import { errorEmbed } from "../utils";

export default createButtonHandler("upvoteSuggestion", async (interaction) => {
  const suggestionService = await SuggestionService.getInstance();

  try {
    await suggestionService.addUserUpvote(
      interaction.message,
      interaction.user
    );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle("Upvoted suggestion")
          .setDescription(
            `[Click here to view the suggestion](${interaction.message.url})`
          ),
      ],
      ephemeral: true,
    });
  } catch (err) {
    if (err instanceof SuggestionNotFoundError) {
      await interaction.reply({
        embeds: [errorEmbed("Failed to find original suggestion")],
        ephemeral: true,
      });
    }
    if (err instanceof UserAlreadyVotedError) {
      await interaction.reply({
        embeds: [errorEmbed(`You have already upvoted this suggestion`)],
        ephemeral: true,
      });
    }
  }
});
