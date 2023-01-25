import { ApplicationCommandType } from "discord.js";

import { defineContextMenuCommand } from "../core";
import { SuggestionService } from "../services";
import { errorEmbed, successEmbed } from "../utils";

export default defineContextMenuCommand({
  name: "Implemented suggestion",
  type: ApplicationCommandType.Message,

  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const suggestionService = await SuggestionService.getInstance();

    const suggestion = await suggestionService.findByMessageId(
      interaction.targetMessage.id
    );

    if (!suggestion) {
      await interaction.reply({
        embeds: [errorEmbed("Suggestion not found")],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [successEmbed("Suggestion implemented")],
      ephemeral: true,
    });
  },
});
