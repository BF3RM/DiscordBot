# RealityMod Discord Bot

RealityMod's Discord Bot that allows people to place suggestions and does certain tasks for us in the background.

## Pre-requisites
- Node.JS 18+
- pnpm 7.8.0+

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/BF3RM/RealityMod-DiscordBot.git
```

2. Install dependencies with pnpm:
```bash
pnpm install
```

3. Make a copy of the `.env.example` and call it `.env`
```bash
cp .env.example .env
```

4. Run a Postgres database (there's a Docker Compose which does this for you)
```bash
docker-compose up -d
```

5. Run the `Launch Bot` target in VS Code (or use F5 as shortcut)

## Structure

The bot uses [Discord.js](https://discordjs.guide) and has a clear structure which can be seen below
```
- src           Source code of the bot
|- buttons      Contains Discord button handlers
|- commands     Contains Discord command handlers
|- core         Contains the framework to create buttons/commands & modals more easily
|- entities     Contains database entities
|- migrations   Contains database migrations
|- modals       Contains Discord modal handlers
|- services     Contains various services
`- tasks        Contains scheduable tasks/jobs
```

### Commands
Adding commands to the bot is easy, command handlers are located in the `src/commands` folder and are loaded automatically.

The following code snippet shows an example on how to write a `/ping` command that sends the message `Pong!` back.
```ts
// src/commands/ping.command.ts
import { defineCommand } from "../core";

export default defineCommand({
  name: "ping",
  configure: (builder) => builder.setDescription("Send me that pong"),
  async execute(interaction) {
    await interaction.reply({ content: "Pong!" });
  }
});
```

More information about writing commands and all their options can be found [here](https://discordjs.guide/slash-commands/response-methods.html)

### Buttons
The previous section explains how to create a new command. In this section we will expand the command with a button that allows you to ping again.
All button handlers are placed in the `src/buttons` folder.
```ts
// src/buttons/ping.button.ts
import { defineButton } from "../core";

export default defineButton({
  prefix: "ping",
  label: "Ping again",
  async handle(interaction) {
    await interaction.reply({ content: 'Pong!' });
  },
});
```

```ts
// src/buttons/index.ts
export { default as PingButton } from './ping.button.ts';
```

```ts
// src/commands/ping.command.ts
import { defineCommand } from "../core";
import { PingButton } from '../buttons'

export default defineCommand({
  name: "ping",
  configure: (builder) => builder.setDescription("Send me that pong"),
  async execute(interaction) {
    await interaction.reply({ content: "Pong!", components: [PingButton.create()] });
  }
});
```

Internally we use the [ButtonBuilder](https://discord.js.org/#/docs/discord.js/main/class/ButtonBuilder) of Discord.js, you can read more information about it [here](https://discordjs.guide/interactions/buttons.html)

### Modals
Modals are a nice way to ask people for more information. They can contain text fields and selection boxes. You can also use them as an extra confirmation step.

In the structure of this bot modal handlers are located in the `src/modals` folder. The example below will expand our button to ask for a validation if you really want to send a new ping.

First of all you have to create the modal itself, all options that can be added can be found [here](https://discordjs.guide/interactions/modals.html)
```ts
// src/modals/ping-confirm.modal.ts
import { defineModal } from "../core";

export default defineModal({
  // A unique id for your modal
  prefix: "pingConfirm",

  // Build the modal, you can also add extra arguments which will also be sent over to the handle function
  build: (builder) =>
    builder
      .setTitle("Are you sure?")
      .setDescription("Are you sure you would like to send another ping?"),

  async handle(interaction) {
    const suggestionService = await SuggestionService.getInstance();

    await interaction.reply({ content: 'Pong!' });
  },
});
```

Also add the export to the `src/modals/index.ts`
```ts
// src/modals/index.ts
export { default as PingConfirmModal } from './ping-confirm.ts';
```

Now we can edit the button we created earlier and tell it to show our modal instead or replying with a message.
```ts
// src/buttons/ping.button.ts
import { defineButton } from "../core";

import { PingConfirmModal } from '../modals';

export default defineButton({
  prefix: "ping",
  label: "Ping again",
  async handle(interaction) {
    await PingConfirmModal.show(interaction);
  },
});
```

Now whenever you click on the `Ping again` button, it should open the confirmation modal and send `Pong!` if you confirm the modal