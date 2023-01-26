import path from "node:path";
import fs from "node:fs";
import { Collection } from "discord.js";
import { Command } from "./command";
import { ButtonHandler } from "./button";
import { ModalHandler } from "./modal";

const fileLoaderFactory =
  <T extends Record<string, any>>(factoryPath: string, key: keyof T) =>
  (collection: Collection<string, T>) => {
    const handlersPath = path.join(__dirname, "..", factoryPath);

    const handlerFiles = fs
      .readdirSync(handlersPath)
      .filter(
        (file) =>
          !file.includes("index") &&
          (file.endsWith(".js") || file.endsWith(".ts"))
      );

    for (const file of handlerFiles) {
      const { default: handler } = require(`${handlersPath}/${file}`) as {
        default: T;
      };

      if (!handler) continue;

      collection.set(handler[key], handler);
    }

    return collection;
  };

export const loadCommands = fileLoaderFactory<Command>(
  "commands",
  "commandName"
);

export const loadButtonHandlers = fileLoaderFactory<ButtonHandler>(
  "buttons",
  "prefix"
);

export const loadModalHandlers = fileLoaderFactory<ModalHandler>(
  "modals",
  "prefix"
);
