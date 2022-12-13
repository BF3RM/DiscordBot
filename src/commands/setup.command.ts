import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
// import { BaseCommand } from "../core";

import { defineCommand } from "../core";

// export default class SetupCommand extends BaseCommand {
//   constructor() {
//     super("setup");
//   }

//   public configure(builder: SlashCommandBuilder) {
//     return builder.setDescription("Set up suggestion shietz");
//   }

//   public async execute(
//     interaction: ChatInputCommandInteraction<CacheType>
//   ): Promise<void> {
//     const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
//       new ButtonBuilder()
//         .setCustomId("newSuggestion")
//         .setLabel("New suggestion")
//         .setStyle(ButtonStyle.Primary)
//     );

//     await interaction.reply({
//       content: "Yow yowww you wanna suggest stuffz?",
//       components: [row],
//     });
//   }
// }

export default defineCommand({
  name: "setup",
  configure: (builder) => builder.setDescription("Set up suggestion shietz"),

  async execute(interaction) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("newSuggestion")
        .setLabel("New suggestion")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content: "Yow yowww you wanna suggest stuffz?",
      components: [row],
    });
  },
});
