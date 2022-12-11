import { bold, Client, EmbedBuilder } from "discord.js";
import { SuggestionEntity } from "../entities";
import { BaseEntityService } from "./entity.service";

export class SuggestionEntityService extends BaseEntityService<SuggestionEntity> {
  constructor() {
    super(SuggestionEntity);
  }

  private static instance: SuggestionEntityService;

  public static async getInstance(): Promise<SuggestionEntityService> {
    if (!this.instance) {
      this.instance = new SuggestionEntityService();
      await this.instance.init();
    }

    return this.instance;
  }

  public generateVotesText(suggestion: SuggestionEntity): string {
    const totalUpvotes = suggestion.upvotes.length;
    const totalDownvotes = suggestion.downvotes.length;
    const totalVotes = totalUpvotes + totalDownvotes;
    const totalUpvotesPercent = Math.round((totalUpvotes / totalVotes) * 100);
    const totalDownvotesPercent = Math.round((totalDownvotes / totalUpvotes) * 100);

    let upvotesStr = `⏫ Upvotes: ${totalUpvotes} (${totalUpvotesPercent}%)`;
    let downvotesStr = `⏬ Downvotes: ${totalDownvotes} (${totalDownvotesPercent}%)`;

    if (totalUpvotes !== totalDownvotes) {
      if (totalUpvotes > totalDownvotes) {
        upvotesStr = bold(upvotesStr);
      }
      else if (totalDownvotes > totalUpvotes) {
        downvotesStr = bold(downvotesStr);
      }
    }

    return `${upvotesStr}\n${downvotesStr}`;
  }

  public async createSuggestionEmbed(client: Client, suggestion: SuggestionEntity) {
    const user = await client.users.fetch(suggestion.suggestedBy);
    if (!user) {
      throw new Error('Failed to find user');
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`#${suggestion.id}: ${suggestion.title}`)
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription(suggestion.message)
      .setFields({ name: "Votes", value: this.generateVotesText(suggestion)});
    
    if (suggestion.imageUrl) {
      embed.setImage(suggestion.imageUrl);
    }

    return embed;
  }
}
