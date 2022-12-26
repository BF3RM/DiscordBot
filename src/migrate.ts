import 'dotenv/config';

import suggestionsBackup from '../backup/suggestions.json';
import { SuggestionEntity, SuggestionStatus } from './entities';
import { getDatabaseConnection } from './services';

const resolveStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return SuggestionStatus.PENDING;
    case 'denied':
      return SuggestionStatus.DENIED;
    case 'approved':
      return SuggestionStatus.APPROVED;
    case 'implemented':
      return SuggestionStatus.IMPLEMENTED;
    default:
      throw new Error(`Failed to resolve status ${status} to a valid SuggestionStatus`);
  }
}

(async () => {
  const dataSource = await getDatabaseConnection();

  await dataSource.runMigrations();

  const repository = dataSource.getRepository(SuggestionEntity);

  const suggestions: SuggestionEntity[] = suggestionsBackup.map((sugg) => ({
    id: sugg.arrayIndex+1,
    channelId: sugg.channel,
    messageId: sugg.msg,
    threadId: sugg.thr,
    suggestedBy: sugg.suggestedBy,
    status: resolveStatus(sugg.status),
    title: `Suggestion`, // Old bot had no title
    description: sugg.contents,
    responseBy: sugg.approvedBy || sugg.deniedBy,
    responseReason: sugg.approveReason || sugg.denyReason,
    upvotes: sugg.votes.upvotes,
    downvotes: sugg.votes.downvotes
  }));

  console.log('Clearing all known suggestions');
  await repository.clear();

  console.log(`Storing ${suggestions.length} suggestions`);
  await repository.save(suggestions);
})();