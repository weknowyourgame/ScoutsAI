export default {
	projectId: process.env.BROWSERBASE_PROJECT_ID || '',
	browserbaseApiKey: process.env.BROWSERBASE_API_KEY || '',
	openaiApiKey: process.env.OPENAI_API_KEY || '',
	modelName: process.env.STAGEHAND_MODEL || 'gpt-4o-mini',
	headless: true,
};


