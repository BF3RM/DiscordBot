import { EmbedBuilder } from "discord.js";
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
}
