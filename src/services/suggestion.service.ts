import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  Client,
  Colors,
  EmbedBuilder,
  Message,
  ThreadChannel,
  User,
} from "discord.js";

import {
  DownvoteSuggestionButton,
  EditSuggestionButton,
  UpvoteSuggestionButton,
} from "../buttons";
import { getSuggestionChannelId } from "../config";
import { getClientInstance } from "../core";
import {
  SuggestionEntity,
  SuggestionStatus,
  SuggestionVoteEntity,
  SuggestionVoteType,
} from "../entities";
import { fetchChannelMessage, fetchTextChannel } from "../utils";

import { BaseEntityService } from "./entity.service";

export class UserAlreadyVotedError extends Error {
  constructor(public readonly user: User, public readonly type: string) {
    super(`User ${user.id} already ${type}`);
  }
}

export class SuggestionNotFoundError extends Error {
  constructor() {
    super(`Suggestion not found`);
  }
}

export class SuggestionAlreadyRepliedError extends Error {
  constructor(public readonly suggestion: SuggestionEntity) {
    super(`Suggestion ${suggestion.id} was already approved or rejected`);
  }
}

export class OwnSuggestionVoteError extends Error {
  constructor(public readonly suggestion: SuggestionEntity) {
    super(`You can't vote on your own suggestion`);
  }
}

export interface CreateSuggestionInput {
  authorId: string;
  title: string;
  description: string;
}

export interface CreateSuggestionOutput {
  suggestion: SuggestionEntity;
  message: Message;
  thread: ThreadChannel;
}

export interface UpdateSuggestionInput {
  title: string;
  description: string;
}

export interface UpdateSuggestionOutput {
  suggestion: SuggestionEntity;
  message: Message;
}

export class SuggestionService {
  constructor(
    private readonly client: Client,
    private readonly suggestionEntityService: BaseEntityService<SuggestionEntity>
  ) {}

  private static instance: SuggestionService;

  public static async getInstance(): Promise<SuggestionService> {
    if (!this.instance) {
      const suggestionEntityService = new BaseEntityService(SuggestionEntity, [
        "votes",
      ]);
      await suggestionEntityService.init();

      this.instance = new SuggestionService(
        getClientInstance(),
        suggestionEntityService
      );
    }

    return this.instance;
  }

  public async findById(id: number) {
    return this.suggestionEntityService.get(id);
  }

  public async findByMessageId(messageId: string) {
    return this.suggestionEntityService.findOne({ messageId });
  }

  public async create(
    input: CreateSuggestionInput
  ): Promise<CreateSuggestionOutput> {
    const suggestionChannel = await fetchTextChannel(
      this.client,
      getSuggestionChannelId()
    );

    const suggestion = await this.suggestionEntityService.create({
      channelId: suggestionChannel.id,
      suggestedBy: input.authorId,
      status: SuggestionStatus.PENDING,
      title: input.title,
      description: input.description,
      votes: [],
    });

    const suggestionEmbed = await this.createSuggestionEmbed(suggestion);
    const row = this.createActionRow();

    const message = await suggestionChannel.send({
      embeds: [suggestionEmbed],
      components: [row],
    });

    const thread = await message.startThread({
      name: `Suggestion ${suggestion.id}`,
      autoArchiveDuration: 10080,
      reason: `Created for suggestion ${suggestion.id}`,
      rateLimitPerUser: 5,
    });

    this.suggestionEntityService.update(suggestion.id, {
      messageId: message.id,
      threadId: thread.id,
    });

    return {
      suggestion,
      message,
      thread,
    };
  }

  public async update(
    suggestionId: number,
    update: UpdateSuggestionInput
  ): Promise<UpdateSuggestionOutput> {
    const suggestion = await this.findById(suggestionId);
    if (!suggestion) {
      throw new SuggestionNotFoundError();
    }

    const originalMessage = await fetchChannelMessage(
      this.client,
      suggestion.channelId,
      suggestion.messageId!
    );
    if (!originalMessage) {
      throw new SuggestionNotFoundError();
    }

    const updatedSuggestion = await this.suggestionEntityService.update(
      suggestion.id,
      {
        title: update.title,
        description: update.description,
      }
    );

    const suggestionEmbed = await this.createSuggestionEmbed(updatedSuggestion);

    await originalMessage.edit({
      embeds: [suggestionEmbed],
      components: [this.createActionRow(false)],
    });

    return {
      suggestion: updatedSuggestion,
      message: originalMessage,
    };
  }

  public async addUserUpvote(
    message: Message,
    user: User
  ): Promise<SuggestionEntity> {
    return this.addUserVote(message, user, SuggestionVoteType.UPVOTE);
  }

  public async addUserDownvote(
    message: Message,
    user: User
  ): Promise<SuggestionEntity> {
    return this.addUserVote(message, user, SuggestionVoteType.DOWNVOTE);
  }

  private async addUserVote(
    message: Message,
    user: User,
    type: SuggestionVoteType
  ) {
    const suggestion = await this.findByMessageId(message.id);
    if (!suggestion) {
      throw new SuggestionNotFoundError();
    }

    if (suggestion.suggestedBy === user.id) {
      throw new OwnSuggestionVoteError(suggestion);
    }

    const existingVote = suggestion.votes.find(
      (vote) => vote.userId === user.id
    );

    if (existingVote) {
      if (existingVote.type === type) {
        throw new UserAlreadyVotedError(
          user,
          type === SuggestionVoteType.UPVOTE ? "approved" : "denied"
        );
      }

      existingVote.type = type;
    } else {
      const vote = new SuggestionVoteEntity();
      vote.type = type;
      vote.userId = user.id;
      suggestion.votes.push(vote);
    }

    const updatedSuggestion = await this.suggestionEntityService.update(
      suggestion.id,
      {
        votes: suggestion.votes,
      }
    );

    const suggestionEmbed = EmbedBuilder.from(message.embeds[0]);

    suggestionEmbed.setFields({
      name: "Votes",
      value: this.generateVotesText(updatedSuggestion),
    });

    await message.edit({ embeds: [suggestionEmbed] });

    return updatedSuggestion;
  }

  public approve(suggestionId: number, user: User, responseReason: string) {
    return this.respond(
      suggestionId,
      user,
      SuggestionStatus.APPROVED,
      responseReason
    );
  }

  public deny(suggestionId: number, user: User, responseReason: string) {
    return this.respond(
      suggestionId,
      user,
      SuggestionStatus.DENIED,
      responseReason
    );
  }

  public async respond(
    suggestionId: number,
    user: User,
    responseStatus: SuggestionStatus.APPROVED | SuggestionStatus.DENIED,
    responseReason: string
  ) {
    const suggestion = await this.suggestionEntityService.get(suggestionId);
    if (!suggestion) {
      throw new SuggestionNotFoundError();
    }

    const originalMessage = await fetchChannelMessage(
      this.client,
      suggestion.channelId,
      suggestion.messageId!
    );
    if (!originalMessage) {
      throw new SuggestionNotFoundError();
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new SuggestionAlreadyRepliedError(suggestion);
    }

    suggestion.status = responseStatus;
    suggestion.responseBy = user.id;
    suggestion.responseReason = responseReason;

    const updatedSuggestion = await this.suggestionEntityService.update(
      suggestion.id,
      suggestion
    );

    const suggestionEmbed = await this.createSuggestionEmbed(
      updatedSuggestion,
      true
    );

    await originalMessage.edit({
      embeds: [suggestionEmbed],
      components: [this.createActionRow(true)],
    });

    if (originalMessage.thread) {
      await originalMessage.thread.edit({
        archived: true,
        locked: true,
      });
    }

    return updatedSuggestion;
  }

  public generateVotesText(suggestion: SuggestionEntity): string {
    const totalUpvotes = suggestion.votes.filter(
      (vote) => vote.type === SuggestionVoteType.UPVOTE
    ).length;
    const totalDownvotes = suggestion.votes.filter(
      (vote) => vote.type === SuggestionVoteType.DOWNVOTE
    ).length;
    const totalVotes = totalUpvotes + totalDownvotes;

    if (totalVotes === 0) {
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

  public createActionRow(disabled = false) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      UpvoteSuggestionButton.create().setDisabled(disabled),
      DownvoteSuggestionButton.create().setDisabled(disabled),
      EditSuggestionButton.create().setDisabled(disabled)
    );
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

  public async createSuggestionEmbed(
    suggestion: SuggestionEntity,
    withTimestamp = false
  ) {
    const user = await this.client.users.fetch(suggestion.suggestedBy);
    if (!user) {
      throw new Error("Failed to find user");
    }

    const embed = new EmbedBuilder()
      .setColor(this.getStatusColor(suggestion))
      .setTitle(`#${suggestion.id}: ${suggestion.title}`)
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription(suggestion.description)
      .setFields({ name: "Votes", value: this.generateVotesText(suggestion) });

    if (suggestion.imageUrl) {
      embed.setImage(suggestion.imageUrl);
    }

    let responseBy: User | undefined;
    if (suggestion.responseBy) {
      responseBy = this.client.users.cache.get(suggestion.responseBy);
    }

    if (suggestion.status === SuggestionStatus.APPROVED) {
      embed.addFields(
        {
          name: "Approved by",
          value: responseBy?.tag || "Unknown#0000",
        },
        {
          name: "Reason",
          value: suggestion.responseReason || "No reason given",
        }
      );
    } else if (suggestion.status === SuggestionStatus.DENIED) {
      embed.addFields(
        {
          name: "Denied by",
          value: responseBy?.tag || "Unknown#0000",
        },
        {
          name: "Reason",
          value: suggestion.responseReason || "No reason given",
        }
      );
    }

    if (withTimestamp) {
      embed.setFooter({ text: "Last updated" }).setTimestamp();
    }

    return embed;
  }
}
