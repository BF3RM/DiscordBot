import { Client } from "discord.js";
import { getClientInstance } from "../core";
import { GuildConfigEntity } from "../entities";
import { BaseEntityService as EntityService } from "./entity.service";

export class GuildConfigService {
  constructor(private readonly client: Client, private readonly guildConfigEntityService: EntityService<GuildConfigEntity>) {
  }

  private static instance: GuildConfigService;

  public static async getInstance(): Promise<GuildConfigService> {
    if (!this.instance) {
      const guildConfigEntityService = new EntityService(GuildConfigEntity);
      await guildConfigEntityService.init();
      
      this.instance = new GuildConfigService(getClientInstance(), guildConfigEntityService);
    }

    return this.instance;
  }

  public getGuildConfig(guildId: string): Promise<GuildConfigEntity | null> {
    return this.guildConfigEntityService.findOne({ guildId });
  }
}