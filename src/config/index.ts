
import { Character, ModelProviderName, settings } from "@elizaos/core";

export function getTokenForProvider(
  provider: ModelProviderName,
  character: Character
) {
  switch (provider) {
    case ModelProviderName.OPENAI:
      return (
        character.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY
      );
    case ModelProviderName.ANTHROPIC:
      return (
        character.settings?.secrets?.ANTHROPIC_API_KEY ||
        character.settings?.secrets?.CLAUDE_API_KEY ||
        settings.ANTHROPIC_API_KEY ||
        settings.CLAUDE_API_KEY
      );
    case ModelProviderName.OPENROUTER:
      return (
        character.settings?.secrets?.OPENROUTER || settings.OPENROUTER_API_KEY
      );
    case ModelProviderName.GROK:
      return character.settings?.secrets?.GROK_API_KEY || settings.GROK_API_KEY;
    case ModelProviderName.HEURIST:
      return (
        character.settings?.secrets?.HEURIST_API_KEY || settings.HEURIST_API_KEY
      );
    case ModelProviderName.GROQ:
      return character.settings?.secrets?.GROQ_API_KEY || settings.GROQ_API_KEY;
  }
}
