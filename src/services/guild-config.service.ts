import { Client, TextChannel } from "discord.js";
import { getClientInstance } from "../core";
import { GuildConfigEntity } from "../entities";
import { BaseEntityService as EntityService } from "./entity.service";

export class GuildNotConfiguredError extends Error {
  constructor(public readonly guildId: string) {
    super(`Guild ${guildId} is not configured yet`);
  }
}
export class GuildConfigService {
  constructor(
    private readonly client: Client,
    private readonly guildConfigEntityService: EntityService<GuildConfigEntity>
  ) {}

  private static instance: GuildConfigService;

  public static async getInstance(): Promise<GuildConfigService> {
    if (!this.instance) {
      const guildConfigEntityService = new EntityService(GuildConfigEntity);
      await guildConfigEntityService.init();

      this.instance = new GuildConfigService(
        getClientInstance(),
        guildConfigEntityService
      );
    }

    return this.instance;
  }

  public getGuildConfig(guildId: string): Promise<GuildConfigEntity | null> {
    return this.guildConfigEntityService.findOne({ guildId });
  }

  public async getGuildSuggestionsChannel(
    guildId: string
  ): Promise<TextChannel> {
    // const settings = await this.getGuildConfig(guildId);
    // if (!settings || !settings.suggestionChannelId) {
    //   throw new GuildNotConfiguredError(guildId);
    // }
    const settings = {
      suggestionChannelId: "1004713417501843456",
    };

    const channel = await this.client.channels.fetch(
      settings.suggestionChannelId
    );
    if (!(channel instanceof TextChannel)) {
      throw new Error("Failed to find text channel");
    }

    return channel;
  }
}
