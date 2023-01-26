import { defineButton } from "../core";

import { NewSuggestionModal } from "../modals";

export default defineButton({
  prefix: "newSuggestion",
  label: "New suggestion",
  async handle(interaction) {
    await NewSuggestionModal.show(interaction);
  },
});
