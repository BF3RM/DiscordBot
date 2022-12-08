import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { BaseButtonHandler } from "../core/button";

export default class SuggestionButtonHandler extends BaseButtonHandler {
  constructor() {
    super("newSuggestion");
  }

  public async handle(interaction: ButtonInteraction): Promise<void> {
    const titleText = new TextInputBuilder()
      .setCustomId("titleInput")
      .setLabel("Title")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descriptionText = new TextInputBuilder()
      .setLabel("Description")
      .setCustomId("descriptionInput")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        titleText
      );
    const secondRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        descriptionText
      );

    const modal = new ModalBuilder()
      .setTitle("New suggestion")
      .setCustomId("suggestionModal")
      .addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
  }
}
