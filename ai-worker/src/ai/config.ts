export type AiProfileId =
  | "task-generator"
  | "analyzer"
  | "researcher"
  | "search"
  | "action"
  | "summarizer"
  | "email";

export interface ModelSpec {
  model: string;
}

export interface ProfileConfig {
  primary: ModelSpec;
  fallbacks?: string[];
  temperature?: number;
}

export const aiProfiles: Record<AiProfileId, ProfileConfig> = {
  "task-generator": {
    primary: { model: "deepseek/deepseek-chat" },
    fallbacks: ["google/gemini-2.5-flash-lite"],
    temperature: 0.2,
  },
  analyzer: {
    primary: { model: "deepseek/deepseek-chat" },
    temperature: 0.1,
  },
  researcher: {
    primary: { model: "perplexity/sonar" },
    fallbacks: ["deepseek/deepseek-chat"],
    temperature: 0.3,
  },
  search: {
    primary: { model: "deepseek/deepseek-chat" },
    temperature: 0.2,
  },
  action: {
    primary: { model: "deepseek/deepseek-chat" },
    temperature: 0.2,
  },
  summarizer: {
    primary: { model: "deepseek/deepseek-chat" },
    temperature: 0.2,
  },
  email: {
    primary: { model: "deepseek/deepseek-chat" },
    temperature: 0.2,
  },
};

export function resolveProfile(profileId: AiProfileId): ProfileConfig {
  return aiProfiles[profileId];
}
