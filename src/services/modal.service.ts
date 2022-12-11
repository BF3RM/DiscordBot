import { CommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";

export class ModalService {
  /**
   * Show modal and await it's response
   * @param interaction 
   * @param modal 
   * @param timeoutTime 
   * @returns 
   */
  static async showModal(interaction: CommandInteraction, modal: ModalBuilder, timeoutTime: number) {
    if (!modal.data.custom_id) {
      throw new Error('Modal has no custom id');
    }

    const filter = (modalInteraction: ModalSubmitInteraction) => {
      modalInteraction.deferUpdate();
      return modalInteraction.user.id === interaction.user.id && modalInteraction.customId === modal.data.custom_id
    }

    await interaction.showModal(modal);

    return interaction.awaitModalSubmit({ filter, time: timeoutTime });
  }
}