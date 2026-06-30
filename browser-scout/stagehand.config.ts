import type { ConstructorParams } from "@browserbasehq/stagehand";

const useBrowserbase = Boolean(process.env.BROWSERBASE_PROJECT_ID && process.env.BROWSERBASE_API_KEY);
const defaultFreeModel = "openai/gpt-oss-20b:free";

function freeOpenRouterModel(value?: string) {
	if (!value) return defaultFreeModel;
	return value.endsWith(":free") || value === "openrouter/free" ? value : defaultFreeModel;
}

const config: ConstructorParams = {
	env: useBrowserbase ? "BROWSERBASE" : "LOCAL",
	projectId: process.env.BROWSERBASE_PROJECT_ID || undefined,
	apiKey: process.env.BROWSERBASE_API_KEY || undefined,
	modelName: freeOpenRouterModel(process.env.STAGEHAND_MODEL),
	modelClientOptions: {
		apiKey: process.env.OPENROUTER_API_KEY || undefined,
		baseURL: "https://openrouter.ai/api/v1",
	},
	localBrowserLaunchOptions: {
		headless: true,
	},
};

export default config;
