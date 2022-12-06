import { SlashCommandBuilder } from "discord.js";

import { BaseSuggestionResponseCommand, SuggestionReplyContext } from "./base/response.command";
import { SuggestionEntity } from "../entities";

export default class ImplementedCommand extends BaseSuggestionResponseCommand {
  constructor() {
    super("implemented", true);
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Implements a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setRequired(true)
          .setAutocomplete(true)
      );
  }

  protected processSuggestion(ctx: SuggestionReplyContext): Promise<SuggestionEntity> {
    throw new Error("Method not implemented.");
  }
}
