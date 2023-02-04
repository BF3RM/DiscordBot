import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

import { defineCommand } from "../core";

import { NewSuggestionButton } from "../buttons";
import {
  getGuildId,
  getSuggestionChannelId,
  getSuggestionResultChannelId,
} from "../config";

export default defineCommand({
  name: "setup",
  configure: (builder) => builder.setDescription("Set up suggestion shietz"),

  async execute(interaction) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      NewSuggestionButton.create().setEmoji("✏️"),
      new ButtonBuilder()
        .setLabel("Suggestions")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/channels/${getGuildId()}/${getSuggestionChannelId()}`
        ),
      new ButtonBuilder()
        .setLabel("Updates")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/channels/${getGuildId()}/${getSuggestionResultChannelId()}`
        )
    );

    const embed = new EmbedBuilder()
      .setTitle("Feedback suggestions")
      .setDescription(
        "Thank you for playing Reality Mod. We continuously try to improve Reality Mod, but we need your help!"
      )
      .addFields([
        {
          name: "Voting",
          value: `
            Check out <#1001968426111213708> to see suggestions made by the community. This is also the place where you can vote and respond to suggestions.
            
            Once a suggestion receives enough upvotes and we decide it fits within Reality Mod we will try to implement it.
            
            Updates about approved and denied suggestions can be found in
            <#1001968620437504121>.
          `,
        },
        {
          name: "New suggestion?",
          value: `
            You can create your own suggestion by pressing on the button bellow. Provide as much details as you can. If you like to attach an image to the suggestion you can do that in the thread that get's created.

            **Before you place a suggestion, check if a similar suggestion was already posted. This saves us a lot of time.**
          `,
        },
      ]);

    await interaction.channel?.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "Done :)",
      ephemeral: true,
    });
  },
});
