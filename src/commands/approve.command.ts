import { SlashCommandBuilder } from "discord.js";

import {
  BaseSuggestionResponseCommand,
  SuggestionReplyContext,
} from "./base/response.command";

export default class ApproveCommand extends BaseSuggestionResponseCommand {
  constructor() {
    super("approve");
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Approves a suggestion")
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
          .setDescription("Reason for approval")
          .setRequired(false)
      );
  }

  protected handleReply(ctx: SuggestionReplyContext): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
