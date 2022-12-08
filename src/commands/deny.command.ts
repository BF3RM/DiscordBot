// import { SlashCommandBuilder } from "discord.js";

// import {
//   BaseSuggestionResponseCommand,
//   SuggestionReplyContext,
// } from "./base/response.command";

// export default class DenyCommand extends BaseSuggestionResponseCommand {
//   constructor() {
//     super("deny");
//   }

//   public configure(builder: SlashCommandBuilder) {
//     return builder
//       .setDescription("Denies a suggestion")
//       .addNumberOption((option) =>
//         option
//           .setName("id")
//           .setDescription("The ID of the suggestion")
//           .setRequired(true)
//           .setAutocomplete(true)
//       )
//       .addStringOption((option) =>
//         option
//           .setName("reason")
//           .setDescription("Reason for denial")
//           .setRequired(true)
//       );
//   }

//   protected handleReply(ctx: SuggestionReplyContext): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
// }
