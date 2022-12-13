import {
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { createModal } from "../core";
import { GuildConfigService, SuggestionEntityService } from "../services";

export default createModal(
  "suggestionModal",
  (builder) => {
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

    return builder
      .setTitle("New suggestion")
      .addComponents(firstRow, secondRow);
  },
  async (interaction) => {
    if (!interaction.inGuild()) return;

    const suggestionService = await SuggestionEntityService.getInstance();
    const guildConfigService = await GuildConfigService.getInstance();

    interaction.deferReply({ ephemeral: true });

    const suggestionsChannel =
      await guildConfigService.getGuildSuggestionsChannel(interaction.guildId);

    const suggestion = await suggestionService.create({
      channelId: suggestionsChannel.id,
      authorId: interaction.user.id,
      title: interaction.fields.getTextInputValue("titleInput"),
      message: interaction.fields.getTextInputValue("descriptionInput"),
    });

    const suggestionEmbed = await suggestionService.createSuggestionEmbed(
      suggestion
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`upvoteSuggestion#${suggestion.id}`)
        .setLabel("Upvote")
        .setStyle(ButtonStyle.Success)
        .setEmoji("⏫"),
      new ButtonBuilder()
        .setCustomId(`downvoteSuggestion#${suggestion.id}`)
        .setLabel("Downvote")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("⏬")
    );

    const message = await suggestionsChannel.send({
      embeds: [suggestionEmbed],
      components: [row],
    });

    const thread = await message.startThread({
      name: `Suggestion ${suggestion.id}`,
      autoArchiveDuration: 10080,
      reason: `Created for suggestion ${suggestion.id}`,
      rateLimitPerUser: 5,
    });

    await suggestionService.updateMessageAndThreadIds(
      suggestion.id,
      message.id,
      thread.id
    );

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle("Suggestion was created")
          .setDescription(`[Click here to view the event](${message.url})`),
      ],
    });
  }
);
