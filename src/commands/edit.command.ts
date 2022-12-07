import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

import { BaseCommand } from "../core";
import { SuggestionStatus } from "../entities";
import { SuggestionEntityService } from "../services";
import {
  errorEmbed,
  fetchChannelMessage,
  getSafeNumber,
  successEmbed,
} from "../utils";
import {
  BaseSuggestionResponseCommand,
  SuggestionReplyContext,
} from "./base/response.command";

export default class EditCommand extends BaseSuggestionResponseCommand {
  constructor() {
    super("edit", true);
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Edits a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("title")
          .setDescription("The new title")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("The new message")
          .setRequired(false)
      )
      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription("The new image")
          .setRequired(false)
      );
  }

  protected async handleReply({
    interaction,
    suggestion,
    suggestionMessage,
    suggestionService,
  }: SuggestionReplyContext): Promise<void> {
    const suggestionEmbed = EmbedBuilder.from(suggestionMessage.embeds[0]);
    const updatedTitle = interaction.options.getString("title");
    const updatedMessage = interaction.options.getString("message");
    const updatedAttachment = interaction.options.getAttachment("image");

    if (updatedTitle) {
      suggestion.title = updatedTitle;
      suggestionEmbed.setTitle(`#${suggestion.id}: ${suggestion.title}`);
    }

    if (updatedMessage) {
      suggestion.message = updatedMessage;
      suggestionEmbed.setDescription(suggestion.message);
    }

    if (updatedAttachment) {
      suggestion.imageUrl = updatedAttachment.url;
      suggestionEmbed.setImage(updatedAttachment.url);
    }

    await suggestionMessage.edit({ embeds: [suggestionEmbed] });
    await suggestionService.update(suggestion.id, suggestion);

    await interaction.editReply({
      embeds: [successEmbed(interaction.client, "Suggestion edited!")],
    });
  }

  public async autocomplete(
    interaction: AutocompleteInteraction
  ): Promise<void> {
    const suggestionService = await SuggestionEntityService.getInstance();

    const focusedValue = interaction.options.getFocused();

    const choices = await suggestionService
      .createQueryBuilder("s")
      .where("s.suggestedBy = :suggestedBy", {
        suggestedBy: interaction.user.id,
      })
      .andWhere("s.id = :id OR s.title ilike :title", {
        id: getSafeNumber(focusedValue),
        title: `%${focusedValue}%`,
      })
      .getMany();

    return interaction.respond(
      choices.map((choice) => ({
        name: `#${choice.id}: ${choice.title}`,
        value: choice.id,
      }))
    );
  }
}
