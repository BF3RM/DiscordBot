import "dotenv/config";

import suggestionsBackup from "../backup/suggestions.json";
import { SuggestionEntity, SuggestionStatus } from "./entities";
import { getDatabaseConnection } from "./services";

(async () => {
  const dataSource = await getDatabaseConnection();

  await dataSource.runMigrations();

  const repository = dataSource.getRepository(SuggestionEntity);

  const suggestions: SuggestionEntity[] = suggestionsBackup
    .filter((sugg) => sugg.status === "pending")
    .map((sugg) => ({
      id: sugg.arrayIndex + 1,
      channelId: sugg.channel,
      messageId: sugg.msg,
      threadId: sugg.thr,
      suggestedBy: sugg.suggestedBy,
      status: SuggestionStatus.PENDING,
      title: `Suggestion`, // Old bot had no title
      description: sugg.contents,
      votes: [], // TODO: Migrate votes
      // responseBy: sugg.approvedBy || sugg.deniedBy,
      // responseReason: sugg.approveReason || sugg.denyReason,
      // upvotes: sugg.votes.upvotes,
      // downvotes: sugg.votes.downvotes,
    }));

  console.log("Clearing all known suggestions");
  await repository.clear();

  console.log(`Storing ${suggestions.length} suggestions`);
  await repository.save(suggestions);
})();
