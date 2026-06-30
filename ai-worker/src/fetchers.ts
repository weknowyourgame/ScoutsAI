import { Context } from "hono";
import { callGatewayAI } from "./utils/gateway";
import { ReqSchema } from "./schemas/gateway";
import { sendEmail } from "./emails/utils";
import { emailReqSchema } from "./schemas/email";
import { analyzeReqSchema } from "./schemas/analyze";
import { generateTasksSchema } from "./schemas/generate-tasks";
import { z } from "zod";
import { todoMakerPrompt } from "./prompts/todo";
import { enqueueTask } from "./queue";
import { generatedTasksSchema } from "./schemas/task";

export async function taskFetcher(c: Context) {
    try {
    const body = await c.req.json();
        console.log('Task fetcher received body:', JSON.stringify(body, null, 2));
        
    const input = ReqSchema.parse(body);
        console.log('Parsed input:', JSON.stringify(input, null, 2));
        
    const response = await callGatewayAI(c.env, input);
        console.log('Gateway AI response:', JSON.stringify(response, null, 2));
    
    return c.json(response as any);
    } catch (error) {
        console.error('Task fetcher error:', error);
        return c.json({
            error: 'Task processing failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? error.stack : undefined
        }, 500);
    }
}

export async function emailNotifier(c: Context) {
    try {
        const body = await c.req.json();
        const input = emailReqSchema.parse(body);
        const response = await sendEmail(c, input);
        return c.json(response as any);
    } catch (error) {
        return c.json({ error: 'Email send failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
}

export async function analyzeRequest(c: Context) {
    try {
        const body = await c.req.json();
        const input = analyzeReqSchema.parse(body);
        const response = await callGatewayAI(c.env, input);
        return c.json(response as any);
    } catch (error) {
        return c.json({ error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
}

export async function generateTasks(c: Context) {
    try {
        const body = await c.req.json();
        const input = generateTasksSchema.parse(body);
        const response = await generateTasksForScout(c.env, input);
        return c.json(response);
    } catch (error) {
        return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
}

export async function queueTask(c: Context) {
    try {
        const body = await c.req.json();
        const result = await enqueueTask(c.env, body);
        return c.json(result, result.success ? 200 : 503);
    } catch (error) {
        return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 400);
    }
}

async function generateTasksForScout(env: Env, input: z.infer<typeof generateTasksSchema>) {
    try {
        console.log('Starting task generation for scout:', input.scoutId);
        console.log('User query:', input.userQuery);
        
        // Call AI to generate tasks
        const aiResponse = await callGatewayAI(env, {
            profile: "task-generator",
            prompt: input.userQuery,
            system_prompt: todoMakerPrompt,
            userId: input.userId,
            scoutId: input.scoutId
        });

        console.log('AI Response received:', JSON.stringify(aiResponse, null, 2));

        // Parse the AI response to extract tasks
        const tasks = generatedTasksSchema.parse(parseTasksFromAIResponse(aiResponse));
        
        console.log('Successfully parsed tasks:', tasks.length);
        
        if (tasks.length < 1) {
            return {
                success: false,
                error: "AI did not generate any todos."
            };
        }
        
        // Do not inject unrelated default tasks; return exactly what AI produced
        
        return {
            success: true,
            scoutId: input.scoutId,
            tasksGenerated: tasks.length,
            tasks: tasks
        };
        
    } catch (error) {
        console.error('Task generation failed:', error);
        console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error');
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

function parseTasksFromAIResponse(aiResponse: any): any[] {
    try {
        // Extract the content from AI response
        const content = aiResponse.choices?.[0]?.message?.content;
        if (!content) {
            console.error('No content in AI response:', aiResponse);
            throw new Error('No content in AI response');
        }

        console.log('AI Response content:', content);

        for (const tasksJson of getJsonCandidates(content)) {
            try {
                console.log('Trying extracted JSON:', tasksJson);
                const parsed = parseJsonLike(tasksJson);
                const tasks = extractTasksArray(parsed);
                if (tasks) {
                    console.log('Parsed tasks:', tasks);
                    return tasks;
                }
            } catch (candidateError) {
                console.warn('Skipping invalid JSON candidate:', candidateError instanceof Error ? candidateError.message : candidateError);
            }
        }

        console.error('No valid JSON tasks found in AI response content');
        console.error('Content was:', content);
        throw new Error('No valid JSON tasks found in AI response');
    } catch (error) {
        console.error('Failed to parse tasks from AI response:', error);
        console.error('AI Response was:', aiResponse);
        throw new Error('Failed to generate tasks from AI response');
    }
}

function extractTasksArray(parsed: unknown): any[] | null {
    if (Array.isArray(parsed)) {
        return parsed;
    }

    if (parsed && typeof parsed === "object" && "tasks" in parsed) {
        const tasks = (parsed as { tasks?: unknown }).tasks;
        return Array.isArray(tasks) ? tasks : null;
    }

    return parsed && typeof parsed === "object" ? [parsed] : null;
}

function getJsonCandidates(content: string): string[] {
    const candidates: string[] = [];
    const fencedBlockPattern = /```(?:json)?\s*([\s\S]*?)```/gi;
    let fencedMatch: RegExpExecArray | null;

    while ((fencedMatch = fencedBlockPattern.exec(content)) !== null) {
        candidates.push(fencedMatch[1].trim());
    }

    candidates.push(content.trim());
    candidates.push(...extractBalancedJsonSnippets(content));

    return Array.from(new Set(candidates.filter(Boolean)));
}

function parseJsonLike(candidate: string): unknown {
    try {
        return JSON.parse(candidate);
    } catch {
        return JSON.parse(stripJsonCommentsAndTrailingCommas(candidate));
    }
}

function extractBalancedJsonSnippets(content: string): string[] {
    const snippets: string[] = [];
    let start = -1;
    let stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let index = 0; index < content.length; index += 1) {
        const char = content[index];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            continue;
        }

        if (char === "{" || char === "[") {
            if (stack.length === 0) {
                start = index;
            }
            stack.push(char);
            continue;
        }

        if (char !== "}" && char !== "]") {
            continue;
        }

        const expectedOpening = char === "}" ? "{" : "[";
        if (stack[stack.length - 1] !== expectedOpening) {
            stack = [];
            start = -1;
            continue;
        }

        stack.pop();
        if (stack.length === 0 && start >= 0) {
            snippets.push(content.slice(start, index + 1).trim());
            start = -1;
        }
    }

    return snippets;
}

function stripJsonCommentsAndTrailingCommas(candidate: string): string {
    let result = "";
    let inString = false;
    let escaped = false;

    for (let index = 0; index < candidate.length; index += 1) {
        const char = candidate[index];
        const nextChar = candidate[index + 1];

        if (inString) {
            result += char;
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            result += char;
            continue;
        }

        if (char === "/" && nextChar === "/") {
            while (index < candidate.length && candidate[index] !== "\n") {
                index += 1;
            }
            result += "\n";
            continue;
        }

        if (char === "/" && nextChar === "*") {
            index += 2;
            while (index < candidate.length && !(candidate[index] === "*" && candidate[index + 1] === "/")) {
                index += 1;
            }
            index += 1;
            continue;
        }

        result += char;
    }

    return stripTrailingCommasOutsideStrings(result).trim();
}

function stripTrailingCommasOutsideStrings(candidate: string): string {
    let result = "";
    let inString = false;
    let escaped = false;

    for (let index = 0; index < candidate.length; index += 1) {
        const char = candidate[index];

        if (inString) {
            result += char;
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            result += char;
            continue;
        }

        if (char === ",") {
            let nextIndex = index + 1;
            while (/\s/.test(candidate[nextIndex] ?? "")) {
                nextIndex += 1;
            }

            if (candidate[nextIndex] === "}" || candidate[nextIndex] === "]") {
                continue;
            }
        }

        result += char;
    }

    return result;
}
