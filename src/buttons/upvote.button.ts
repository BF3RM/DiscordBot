import { ButtonInteraction, CacheType, EmbedBuilder } from "discord.js";
import { BaseButtonHandler } from "../core/button";
import { SuggestionEntityService } from "../services";
import { errorEmbed, fetchChannelMessage, successEmbed } from "../utils";

export default class ApproveSuggestionButtonHandler extends BaseButtonHandler {
  constructor() {
    super("upvote");
  }

  public async handle(
    interaction: ButtonInteraction<CacheType>
  ): Promise<void> {
    const suggestionService = await SuggestionEntityService.getInstance();

    const args = this.getArguments(interaction, 1);

    await interaction.deferReply({ ephemeral: true });

    const suggestion = await suggestionService.get(parseInt(args[0]));
    if (!suggestion) {
      await interaction.editReply({
        embeds: [errorEmbed(interaction.client, "Failed to find suggestion")],
      });
      return;
    }

    if (suggestion.suggestedBy === interaction.user.id) {
      await interaction.editReply({
        embeds: [
          errorEmbed(
            interaction.client,
            "You cannot vote on your own suggestion"
          ),
        ],
      });
      return;
    }

    if (
      suggestion.upvotes.includes(interaction.user.id) ||
      suggestion.downvotes.includes(interaction.user.id)
    ) {
      let vote = suggestion.upvotes.includes(interaction.user.id)
        ? "Upvote"
        : "Downvote";
      await interaction.editReply({
        embeds: [
          errorEmbed(
            interaction.client,
            `You have already voted on this suggestion (${vote}).`
          ),
        ],
      });
      return;
    }

    const originalMessage = await fetchChannelMessage(
      interaction.client,
      suggestion.channelId,
      suggestion.messageId!
    );

    if (!originalMessage) {
      await interaction.editReply({
        embeds: [
          errorEmbed(interaction.client, "Failed to find original suggestion"),
        ],
      });
      return;
    }

    const suggestionEmbed = EmbedBuilder.from(originalMessage.embeds[0]);

    suggestion.upvotes.push(interaction.user.id);
    suggestionEmbed.setFields({
      name: "Votes",
      value: `⏫ Upvotes: ${suggestion.upvotes.length}\n⏬ Downvotes: ${suggestion.downvotes.length}`,
    });

    await originalMessage.edit({ embeds: [suggestionEmbed] });
    await suggestionService.update(suggestion.id, suggestion);

    await interaction.editReply({
      embeds: [successEmbed(interaction.client, "Upvoted suggestion")],
    });
  }
}
