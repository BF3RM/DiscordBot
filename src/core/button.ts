import fs from "node:fs";
import path from "node:path";

import { ButtonInteraction, Collection } from "discord.js";

import { EsModule } from "./types";

export const loadButtonHandlers = () => {
  const handlersPath = path.join(__dirname, "..", "buttons");
  const buttonHandlers = new Collection<string, BaseButtonHandler>();

  const handlerFiles = fs
    .readdirSync(handlersPath)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  for (const file of handlerFiles) {
    const { default: handlerType } =
      require(`${handlersPath}/${file}`) as EsModule<BaseButtonHandler>;

    const handler = new handlerType();

    buttonHandlers.set(handler.customIdPrefix, handler);
  }

  return buttonHandlers;
};

export abstract class BaseButtonHandler {
  constructor(public readonly customIdPrefix: string) {
    if (customIdPrefix.includes("#")) {
      throw new Error("Prefix can not contain a #");
    }
  }

  protected getArguments(
    interaction: ButtonInteraction,
    requiredAmount?: number
  ): string[] {
    const args = interaction.customId.split("#");
    args.shift(); // Remove prefix

    if (requiredAmount !== undefined && args.length !== requiredAmount) {
      throw new Error(
        `Invalid amount of arguments, expected ${requiredAmount}, got ${args.length}`
      );
    }

    return args;
  }

  public abstract handle(interaction: ButtonInteraction): Promise<void>;
}
