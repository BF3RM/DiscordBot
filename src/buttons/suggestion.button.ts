import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { createButtonHandler } from "../core/button";
import { ModalService } from "../services/modal.service";

import NewSuggestionModal from "../modals/new-suggestion.modal";

export default createButtonHandler("newSuggestion", async (interaction) => {
  await NewSuggestionModal.show(interaction);

  // const titleText = new TextInputBuilder()
  //   .setCustomId("titleInput")
  //   .setLabel("Title")
  //   .setStyle(TextInputStyle.Short)
  //   .setRequired(true);

  // const descriptionText = new TextInputBuilder()
  //   .setLabel("Description")
  //   .setCustomId("descriptionInput")
  //   .setStyle(TextInputStyle.Paragraph)
  //   .setRequired(true);

  // const firstRow =
  //   new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
  //     titleText
  //   );
  // const secondRow =
  //   new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
  //     descriptionText
  //   );

  // const modal = new ModalBuilder()
  //   .setTitle("New suggestion")
  //   .setCustomId("suggestionModal")
  //   .addComponents(firstRow, secondRow);

  // const submitInteraction = await ModalService.showModal(
  //   interaction,
  //   modal,
  //   120_000
  // );

  // await submitInteraction.reply({
  //   content: "DONE WITH YOU YOU LAZY FUCK",
  //   ephemeral: true,
  // });
});
