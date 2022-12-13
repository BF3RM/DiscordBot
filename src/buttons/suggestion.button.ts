import { createButtonHandler } from "../core/button";

import NewSuggestionModal from "../modals/new-suggestion.modal";

export default createButtonHandler("newSuggestion", async (interaction) => {
  await NewSuggestionModal.show(interaction);
});
