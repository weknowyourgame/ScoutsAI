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
    primary: { model: "deepseek/deepseek-v3" },
    fallbacks: ["google/gemini-2.5-flash"],
    temperature: 0.2,
  },
  analyzer: {
    primary: { model: "deepseek/deepseek-v3" },
    temperature: 0.1,
  },
  researcher: {
    primary: { model: "perplexity/sonar" },
    fallbacks: ["deepseek/deepseek-v3"],
    temperature: 0.3,
  },
  search: {
    primary: { model: "deepseek/deepseek-v3" },
    temperature: 0.2,
  },
  action: {
    primary: { model: "deepseek/deepseek-v3" },
    temperature: 0.2,
  },
  summarizer: {
    primary: { model: "deepseek/deepseek-v3" },
    temperature: 0.2,
  },
  email: {
    primary: { model: "deepseek/deepseek-v3" },
    temperature: 0.2,
  },
};

export function resolveProfile(profileId: AiProfileId): ProfileConfig {
  return aiProfiles[profileId];
}
