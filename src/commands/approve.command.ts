import {
  ActionRowBuilder,
  ApplicationCommandType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { createContextMenuCommand } from "../core";
import { SuggestionStatus } from "../entities";
import { SuggestionEntityService } from "../services";
import { ModalService } from "../services/modal.service";
import { errorEmbed, successEmbed } from "../utils";

export default createContextMenuCommand(
  "Approve suggestion",
  ApplicationCommandType.Message,
  async (interaction) => {
    if (!interaction.isMessageContextMenuCommand()) return;

    const suggestionService = await SuggestionEntityService.getInstance();

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

    const modalInteraction = await ModalService.showModal(
      interaction,
      modal,
      120_000
    );

    suggestion.responseBy = interaction.user.id;
    suggestion.responseReason =
      modalInteraction.fields.getTextInputValue("reasonInput");
    suggestion.status = SuggestionStatus.APPROVED;

    await modalInteraction.reply({
      embeds: [successEmbed("Suggestion approved")],
      ephemeral: true,
    });
  }
);
