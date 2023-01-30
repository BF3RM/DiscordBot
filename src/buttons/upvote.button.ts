import { ButtonStyle, Colors, EmbedBuilder } from "discord.js";

import { defineButton } from "../core";
import { LoggerFactory } from "../logger.factory";
import {
  UserAlreadyVotedError,
  SuggestionService,
  SuggestionNotFoundError,
  OwnSuggestionVoteError,
} from "../services";
import { errorEmbed } from "../utils";

const logger = LoggerFactory.getLogger("UpvoteSuggestionHandler");

export default defineButton({
  prefix: "upvoteSuggestion",
  label: "Upvote",
  emoji: "⏫",
  style: ButtonStyle.Success,

  async handle(interaction) {
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
          embeds: [errorEmbed("Failed to find suggestion")],
          ephemeral: true,
        });
      } else if (err instanceof UserAlreadyVotedError) {
        await interaction.reply({
          embeds: [errorEmbed(`You have already upvoted this suggestion`)],
          ephemeral: true,
        });
      } else if (err instanceof OwnSuggestionVoteError) {
        await interaction.reply({
          embeds: [errorEmbed(`You can not vote on your own suggestion`)],
          ephemeral: true,
        });
      } else {
        logger.error(err);
      }
    }
  },
});
