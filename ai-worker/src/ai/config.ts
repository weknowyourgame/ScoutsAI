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
    primary: { model: "qwen/qwen3-next-80b-a3b-instruct:free" },
    fallbacks: ["openai/gpt-oss-20b:free", "meta-llama/llama-3.3-70b-instruct:free"],
    temperature: 0.2,
  },
  analyzer: {
    primary: { model: "openai/gpt-oss-20b:free" },
    fallbacks: ["qwen/qwen3-next-80b-a3b-instruct:free"],
    temperature: 0.1,
  },
  researcher: {
    primary: { model: "openai/gpt-oss-120b:free" },
    fallbacks: ["qwen/qwen3-next-80b-a3b-instruct:free", "nvidia/nemotron-3-super-120b-a12b:free"],
    temperature: 0.3,
  },
  search: {
    primary: { model: "qwen/qwen3-next-80b-a3b-instruct:free" },
    fallbacks: ["meta-llama/llama-3.3-70b-instruct:free"],
    temperature: 0.2,
  },
  action: {
    primary: { model: "qwen/qwen3-next-80b-a3b-instruct:free" },
    fallbacks: ["openai/gpt-oss-20b:free"],
    temperature: 0.2,
  },
  summarizer: {
    primary: { model: "openai/gpt-oss-120b:free" },
    fallbacks: ["qwen/qwen3-next-80b-a3b-instruct:free"],
    temperature: 0.2,
  },
  email: {
    primary: { model: "meta-llama/llama-3.3-70b-instruct:free" },
    fallbacks: ["qwen/qwen3-next-80b-a3b-instruct:free"],
    temperature: 0.2,
  },
};

export function resolveProfile(profileId: AiProfileId): ProfileConfig {
  return aiProfiles[profileId];
}
