import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { BaseCommand } from "../core";
import { SuggestionStatus } from "../entities";
import { SuggestionEntityService } from "../services";
import { createDefaultEmbed } from "../utils";

export default class SuggestCommand extends BaseCommand {
  constructor() {
    super("suggest");
  }

  public configure(builder: SlashCommandBuilder) {
    return builder
      .setDescription("Suggest something to be added to RM!")
      .addStringOption((option) =>
        option
          .setName("title")
          .setDescription("Suggestion title")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Suggestion Message")
          .setRequired(true)
      )
      .addAttachmentOption((option) =>
        option
          .setRequired(false)
          .setName("image")
          .setDescription("Suggestion Image")
      );
  }

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    if (!(interaction.channel instanceof TextChannel)) return;

    const suggestionService = await SuggestionEntityService.getInstance();

    const attachement = interaction.options.getAttachment("image");

    const suggestion = await suggestionService.create({
      channelId: interaction.channelId,
      suggestedBy: interaction.user.id,
      status: SuggestionStatus.PENDING,
      title: interaction.options.getString("title", true),
      message: interaction.options.getString("message", true),
      imageUrl: attachement?.url,
      upvotes: [],
      downvotes: [],
    });

    const suggestionEmbed = createDefaultEmbed(interaction.client)
      .setColor("#0099ff")
      .setTitle(`#${suggestion.id}: ${suggestion.title}`)
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        suggestion.message + "\n\n**Votes**\n⏫ Upvotes: 0\n⏬ Downvotes: 0"
      )
      .setImage(attachement?.url ?? null);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`upvote#${suggestion.id}`)
        .setLabel("Upvote")
        .setStyle(3)
        .setEmoji("⏫"),
      new ButtonBuilder()
        .setCustomId(`downvote#${suggestion.id}`)
        .setLabel("Downvote")
        .setStyle(4)
        .setEmoji("⏬")
    );

    const message = await interaction.followUp({
      embeds: [suggestionEmbed],
      components: [row],
    });

    suggestion.messageId = message.id;

    const thread = await interaction.channel.threads.create({
      startMessage: message.id,
      name: `Suggestion ${suggestion.id} discussion`,
      autoArchiveDuration: 10080,
      reason: `Created for suggestion ${suggestion.id}`,
      rateLimitPerUser: 5,
    });

    suggestion.threadId = thread.id;

    await suggestionService.update(suggestion.id, suggestion);
  }
}
