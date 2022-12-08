import {
  ActionRowBuilder,
  ApplicationCommandType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { createContextMenuCommand } from "../core";
import { SuggestionEntityService } from "../services";
import { errorEmbed, successEmbed } from "../utils";

export default createContextMenuCommand(
  "Approve suggestion",
  ApplicationCommandType.Message,
  async (interaction) => {
    if (!interaction.isMessageContextMenuCommand()) return;

    const suggestionService = await SuggestionEntityService.getInstance();

    const suggestion = await suggestionService.findOne({
      messageId: interaction.targetMessage.id,
    });

    if (!suggestion) {
      await interaction.reply({
        embeds: [errorEmbed("Suggestion not found")],
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder()
      .setTitle(`Approve #${suggestion.id}?`)
      .setCustomId("approveModal")
      .setComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("reasonInput")
            .setLabel("Reason")
            .setStyle(TextInputStyle.Paragraph)
        )
      );

    await interaction.showModal(modal);

    const submitInteraction = await interaction.awaitModalSubmit({
      time: 60000,
    });

    await submitInteraction.reply({
      embeds: [successEmbed("Suggestion approved")],
      ephemeral: true,
    });
  }
);
