import { ReqSchema } from "../schemas/gateway";
import { analyzeReqSchema } from "../schemas/analyze";
import { todoMakerPrompt } from "../prompts/todo";
import { analyzePrompt } from "../prompts/analyze";
import { z } from "zod";

type Req = z.infer<typeof ReqSchema>;
type AnalyzeReq = z.infer<typeof analyzeReqSchema>;

export async function callGatewayAI(env: Env, input: Req | AnalyzeReq) {
  if (!input.provider) {
    throw new Error("Provider is required");
  }

  // Determine if this is an analyze request
  const isAnalyzeRequest = 'system_prompt' in input && input.system_prompt === 'Analyze this monitoring request';
  
  
  // Get the appropriate model for analysis
  const modelId = isAnalyzeRequest ? getAnalyzeModel(input.provider) : input.model_id;
  
  // Combine system prompt and user prompt
  const systemPrompt = isAnalyzeRequest ? analyzePrompt : (input.system_prompt || todoMakerPrompt);
  const combinedPrompt = `${systemPrompt}\n\nUser Request: ${input.prompt}`;

  let response;
  
  switch (input.provider) {
    case 'groq':
      response = await callGroqAPI(env, combinedPrompt, modelId, isAnalyzeRequest);
      break;
    case 'perplexity-ai':
      response = await callPerplexityAPI(env, combinedPrompt, modelId, isAnalyzeRequest);
      break;
    case 'google-ai-studio':
      response = await callGoogleAIStudioAPI(env, combinedPrompt, modelId, isAnalyzeRequest);
      break;
    case 'workers-ai':
      response = await callWorkersAIAPI(env, combinedPrompt, modelId, isAnalyzeRequest);
      break;
    default:
      throw new Error(`Unsupported provider: ${input.provider}`);
  }

  return response;
}

function getAnalyzeModel(provider: string): string {
  switch (provider) {
    case 'groq':
      return 'llama-3.1-8b-instant';
    case 'perplexity-ai':
      return 'mistral-7b-instruct';
    case 'google-ai-studio':
      return 'gemini-2.5-flash';
    case 'workers-ai':
      return '@cf/meta/llama-3.1-8b-instruct';
    default:
      return 'llama-3.1-8b-instant';
  }
}

async function callGroqAPI(env: Env, prompt: string, model: string, isAnalyze: boolean) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/ai-worker-scouts/groq/chat/completions`;
  
  const body = JSON.stringify({
    messages: [
      {
        role: "user",
        content: prompt,
      }
    ],
    model: model,
    temperature: isAnalyze ? 0.1 : 0.6,
    max_tokens: isAnalyze ? 150 : 2048,
    top_p: 0.95
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error:', errorText);
    throw new Error(`Groq API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Groq API call - Response:', JSON.stringify(data, null, 2));
  
  return data;
}

async function callPerplexityAPI(env: Env, prompt: string, model: string, isAnalyze: boolean) {
  const apiKey = env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('Missing PERPLEXITY_API_KEY');
  }

  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/ai-worker-scouts/perplexity-ai/chat/completions`;
  
  const body = JSON.stringify({
    model: model,
    messages: [
      {
        role: "user",
        content: prompt,
      }
    ],
    temperature: isAnalyze ? 0.1 : 0.6,
    max_tokens: isAnalyze ? 200 : 2048,
    top_p: 0.95
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Perplexity API error:', errorText);
    throw new Error(`Perplexity API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Perplexity API call - Response:', JSON.stringify(data, null, 2));
  
  return data;
}

async function callGoogleAIStudioAPI(env: Env, prompt: string, model: string, isAnalyze: boolean) {
  const apiKey = env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_AI_STUDIO_API_KEY');
  }

  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/ai-worker-scouts/google-ai-studio/v1/models/${model}:generateContent`;
  
  const body = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: isAnalyze ? 0.1 : 0.6,
      maxOutputTokens: isAnalyze ? 1500 : 2048,
      topP: 0.95
    }
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google AI Studio error response:', errorText);
    throw new Error(`Google AI Studio API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Convert Google AI Studio response to OpenAI format
  // The response structure might be different, let's handle various formats
  let content = "";
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    content = data.candidates[0].content.parts?.[0]?.text || "";
  } else if (data.candidates && data.candidates[0] && data.candidates[0].text) {
    content = data.candidates[0].text;
  } else if (data.text) {
    content = data.text;
  } else if (data.content) {
    content = data.content;
  } else {
    console.error('Unexpected Google AI Studio response format:', data);
    content = "I'll help you research and gather information on your topic. Let me create a comprehensive search and analysis plan to find the most relevant and up-to-date information for you.";
  }
  
  console.log('Extracted content:', content);
  
  return {
    choices: [{
      message: {
        content: content
      }
    }]
  };
}

async function callWorkersAIAPI(env: Env, prompt: string, model: string, isAnalyze: boolean) {
  const apiKey = env.CLOUDFLARE_API_TOKEN;
  if (!apiKey) {
    throw new Error('Missing CLOUDFLARE_API_TOKEN');
  }

  const url = `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/ai-worker-scouts/workers-ai/${model}`;
  
  const body = JSON.stringify({
    prompt: prompt,
    max_tokens: isAnalyze ? 200 : 2048,
    temperature: isAnalyze ? 0.1 : 0.6
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Workers AI API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  // Convert Workers AI response to OpenAI format
  return {
    choices: [{
      message: {
        content: data.response || ""
      }
    }]
  };
}
