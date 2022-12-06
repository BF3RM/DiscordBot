import { AutocompleteInteraction, ChatInputCommandInteraction, Message } from "discord.js";

import { BaseCommand } from "../../core";
import { SuggestionEntity, SuggestionStatus } from "../../entities";
import { SuggestionEntityService } from "../../services";
import { errorEmbed, fetchChannelMessage, getSafeNumber } from "../../utils";

export interface SuggestionReplyContext {
  interaction: ChatInputCommandInteraction;
  suggestionService: SuggestionEntityService;
  suggestion: SuggestionEntity;
  suggestionMessage: Message<true>;
  // suggestionThread:
}

export abstract class BaseSuggestionResponseCommand extends BaseCommand {
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const suggestionService = await SuggestionEntityService.getInstance();

    const suggestion = await suggestionService.get(
      interaction.options.getNumber("id", true)
    );
    if (!suggestion) {
      await interaction.editReply({
        embeds: [errorEmbed(interaction.client, "Failed to find suggestion")],
      });
      return;
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      await interaction.editReply({
        embeds: [
          errorEmbed(
            interaction.client,
            `This suggestion was already ${suggestion.status.toLowerCase()}!`
          ),
        ],
      });
    }

    const suggestionMessage = await fetchChannelMessage(
      interaction.client,
      suggestion.channelId,
      suggestion.messageId!
    );

    if (!suggestionMessage) {
      await interaction.editReply({
        embeds: [
          errorEmbed(interaction.client, "Failed to find original suggestion"),
        ],
      });
      return;
    }

    const ctx: SuggestionReplyContext = {
      interaction,
      suggestionService,
      suggestion,
      suggestionMessage
    }

    const updatedSuggestion = await this.processSuggestion(ctx);
    await suggestionService.update(suggestion.id, updatedSuggestion);
  }

  protected abstract processSuggestion(ctx: SuggestionReplyContext): Promise<SuggestionEntity>;

  public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const suggestionService = await SuggestionEntityService.getInstance();

    const focusedValue = interaction.options.getFocused();

    const choices = await suggestionService
      .createQueryBuilder("s")
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