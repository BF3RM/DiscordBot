import { SlashCommandBuilder } from "discord.js";

import {
  BaseSuggestionResponseCommand,
  SuggestionReplyContext,
} from "./base/response.command";

export default class ImplementedCommand extends BaseSuggestionResponseCommand {
  constructor() {
    super("implemented");
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

  protected handleReply(ctx: SuggestionReplyContext): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
