import { SlashCommandBuilder } from "discord.js";

import { BaseSuggestionResponseCommand, SuggestionReplyContext } from "./base/response.command";
import { SuggestionEntity } from "../entities";

export default class DenyCommand extends BaseSuggestionResponseCommand {
  constructor() {
    super("deny", true);
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Denies a suggestion")
      .addNumberOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the suggestion")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Reason for denial")
          .setRequired(false)
      );
  }

  protected processSuggestion(ctx: SuggestionReplyContext): Promise<SuggestionEntity> {
    throw new Error("Method not implemented.");
  }
}
