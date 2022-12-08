import path from "node:path";
import fs from "node:fs";
import { Collection } from "discord.js";
import { Command } from "./command";

const fileLoaderFactory =
  <T extends Record<string, any>>(factoryPath: string, key: keyof T) =>
  () => {
    const handlersPath = path.join(__dirname, "..", factoryPath);
    const handlers = new Collection<string, T>();

    const handlerFiles = fs
      .readdirSync(handlersPath)
      .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of handlerFiles) {
      const { default: handler } = require(`${handlersPath}/${file}`) as {
        default: T;
      };

      if (!handler) continue;

      handlers.set(handler[key], handler);
    }

    return handlers;
  };

export const loadCommands = fileLoaderFactory<Command>(
  "commands",
  "commandName"
);
