import { ActionRowBuilder, ButtonBuilder } from "discord.js";

import { defineCommand } from "../core";

import { NewSuggestionButton } from "../buttons";

export default defineCommand({
  name: "setup",
  configure: (builder) => builder.setDescription("Set up suggestion shietz"),

  async execute(interaction) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      NewSuggestionButton.create()
    );

    await interaction.reply({
      content: "Yow yowww you wanna suggest stuffz?",
      components: [row],
    });
  },
});
