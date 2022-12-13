import { bold, Client, Colors, EmbedBuilder, User } from "discord.js";
import { getClientInstance } from "../core";
import { SuggestionEntity, SuggestionStatus } from "../entities";
import { BaseEntityService } from "./entity.service";

export class UserAlreadyVotedError extends Error {
  constructor(public readonly user: User, public readonly type: string) {
    super(`User ${user.id} already ${type}`);
  }
}

export interface CreateSuggestionInput {
  channelId: string;
  authorId: string;
  title: string;
  message: string;
}

export class SuggestionEntityService {
  constructor(
    private readonly client: Client,
    private readonly entityService: BaseEntityService<SuggestionEntity>
  ) {}

  private static instance: SuggestionEntityService;

  public static async getInstance(): Promise<SuggestionEntityService> {
    if (!this.instance) {
      const entityService = new BaseEntityService(SuggestionEntity);
      await entityService.init();

      this.instance = new SuggestionEntityService(
        getClientInstance(),
        entityService
      );
    }

    return this.instance;
  }

  public async findById(id: number) {
    return this.entityService.get(id);
  }

  public async findByMessageId(messageId: string) {
    return this.entityService.findOne({ messageId });
  }

  public async create(input: CreateSuggestionInput): Promise<SuggestionEntity> {
    return this.entityService.create({
      channelId: input.channelId,
      suggestedBy: input.authorId,
      status: SuggestionStatus.PENDING,
      title: input.title,
      message: input.message,
      // imageUrl: attachement?.url,
      upvotes: [],
      downvotes: [],
    });
  }

  public updateMessageAndThreadIds(
    suggestionId: number,
    messageId: string,
    threadId: string
  ): Promise<SuggestionEntity> {
    return this.entityService.update(suggestionId, {
      messageId,
      threadId,
    });
  }

  public async addUserUpvote(
    suggestionId: number,
    user: User
  ): Promise<SuggestionEntity> {
    const suggestion = await this.entityService.get(suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    // Remove downvote if it exists
    const voteIdx = suggestion.downvotes.indexOf(user.id);
    if (voteIdx !== -1) {
      suggestion.downvotes.splice(voteIdx, 1);
    }

    if (suggestion.upvotes.includes(user.id)) {
      throw new UserAlreadyVotedError(user, "upvoted");
    }

    suggestion.upvotes.push(user.id);

    return this.entityService.update(suggestion.id, {
      downvotes: suggestion.downvotes,
      upvotes: suggestion.upvotes,
    });
  }

  public async addUserDownvote(
    suggestionId: number,
    user: User
  ): Promise<SuggestionEntity> {
    const suggestion = await this.entityService.get(suggestionId);
    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    // Remove downvote if it exists
    const voteIdx = suggestion.upvotes.indexOf(user.id);
    if (voteIdx !== -1) {
      suggestion.upvotes.splice(voteIdx, 1);
    }

    if (suggestion.downvotes.includes(user.id)) {
      throw new UserAlreadyVotedError(user, "downvoted");
    }

    suggestion.downvotes.push(user.id);

    return this.entityService.update(suggestion.id, {
      downvotes: suggestion.downvotes,
      upvotes: suggestion.upvotes,
    });
  }

  public generateVotesText(suggestion: SuggestionEntity): string {
    const totalUpvotes = suggestion.upvotes.length;
    const totalDownvotes = suggestion.downvotes.length;
    const totalVotes = totalUpvotes + totalDownvotes;

    if (totalUpvotes === 0) {
      return `⏫ Upvotes: ${totalUpvotes}\n⏬ Downvotes: ${totalDownvotes}`;
    }

    const totalUpvotesPercent = Math.round((totalUpvotes / totalVotes) * 100);
    const totalDownvotesPercent = Math.round(
      (totalDownvotes / totalVotes) * 100
    );

    let upvotesStr = `⏫ Upvotes: ${totalUpvotes} (${totalUpvotesPercent}%)`;
    let downvotesStr = `⏬ Downvotes: ${totalDownvotes} (${totalDownvotesPercent}%)`;

    if (totalUpvotes !== totalDownvotes) {
      if (totalUpvotes > totalDownvotes) {
        upvotesStr = bold(upvotesStr);
      } else if (totalDownvotes > totalUpvotes) {
        downvotesStr = bold(downvotesStr);
      }
    }

    return `${upvotesStr}\n${downvotesStr}`;
  }

  public getStatusColor(suggestion: SuggestionEntity) {
    switch (suggestion.status) {
      case SuggestionStatus.PENDING:
        return "#0099ff";
      case SuggestionStatus.APPROVED:
        return Colors.Green;
      case SuggestionStatus.DENIED:
        return Colors.Red;
      case SuggestionStatus.IMPLEMENTED:
        return Colors.Grey;
    }
  }

  public async createSuggestionEmbed(suggestion: SuggestionEntity) {
    const user = await this.client.users.fetch(suggestion.suggestedBy);
    if (!user) {
      throw new Error("Failed to find user");
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`#${suggestion.id}: ${suggestion.title}`)
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription(suggestion.message)
      .setFields({ name: "Votes", value: this.generateVotesText(suggestion) });

    if (suggestion.imageUrl) {
      embed.setImage(suggestion.imageUrl);
    }

    return embed;
  }
}
