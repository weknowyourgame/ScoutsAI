import { Context } from "hono";
import { callGatewayAI } from "./utils/gateway";
import { ReqSchema } from "./schemas/gateway";
import { sendEmail } from "./emails/utils";
import { emailReqSchema } from "./schemas/email";
import { analyzeReqSchema } from "./schemas/analyze";
import { generateTasksSchema } from "./schemas/generate-tasks";
import { z } from "zod";
import { storeTasksInDatabase, TaskData } from "./utils/database";
import { todoMakerPrompt } from "./prompts/todo";

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
    const body = await c.req.json();
    const input = emailReqSchema.parse(body);
    const response = await sendEmail(c, input);

    return c.json(response as any);
}

export async function analyzeRequest(c: Context) {
    const body = await c.req.json();
    
    const input = analyzeReqSchema.parse(body);
    
    const response = await callGatewayAI(c.env, input);
    console.log('Gateway response:', JSON.stringify(response, null, 2));

    return c.json(response as any);
}

export async function generateTasks(c: Context) {
    const body = await c.req.json();
    
    const input = generateTasksSchema.parse(body);
    
    // Call the task generation logic
    const response = await generateTasksForScout(c.env, input);
    console.log('Task generation response:', JSON.stringify(response, null, 2));

    return c.json(response);
}

async function generateTasksForScout(env: Env, input: z.infer<typeof generateTasksSchema>) {
    try {
        console.log('Starting task generation for scout:', input.scoutId);
        console.log('User query:', input.userQuery);
        
        // Call AI to generate tasks
        const aiResponse = await callGatewayAI(env, {
            provider: input.provider as any,
            model_id: input.model_id as any,
            prompt: input.userQuery,
            system_prompt: todoMakerPrompt
        });

        console.log('AI Response received:', JSON.stringify(aiResponse, null, 2));

        // Parse the AI response to extract tasks
        const tasks = parseTasksFromAIResponse(aiResponse);
        
        console.log('Successfully parsed tasks:', tasks.length);
        
        // Validate that we have multiple todos
        if (tasks.length < 2) {
            console.error('AI only generated', tasks.length, 'todos. Expected at least 2.');
            return {
                success: false,
                error: `AI only generated ${tasks.length} todos. Expected at least 2 todos for comprehensive monitoring.`
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

        // Try multiple patterns to extract JSON
        let tasksJson = null;
        
        // Pattern 1: ```json ... ```
        let tasksMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (tasksMatch) {
            tasksJson = tasksMatch[1];
        }
        
        // Pattern 2: ``` ... ``` (without json specifier)
        if (!tasksJson) {
            tasksMatch = content.match(/```\n([\s\S]*?)\n```/);
            if (tasksMatch) {
                tasksJson = tasksMatch[1];
            }
        }
        
        // Pattern 3: Look for JSON array directly
        if (!tasksJson) {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                tasksJson = jsonMatch[0];
            }
        }
        
        // Pattern 4: Look for JSON object with tasks array
        if (!tasksJson) {
            const objectMatch = content.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                try {
                    const parsed = JSON.parse(objectMatch[0]);
                    if (parsed.tasks && Array.isArray(parsed.tasks)) {
                        return parsed.tasks;
                    }
                } catch (e) {
                    // Continue to next pattern
                }
            }
        }

        if (!tasksJson) {
            console.error('No JSON found in AI response content');
            console.error('Content was:', content);
            throw new Error('No JSON tasks found in AI response');
        }

        console.log('Extracted JSON:', tasksJson);
        
        const tasks = JSON.parse(tasksJson);
        console.log('Parsed tasks:', tasks);
        
        return Array.isArray(tasks) ? tasks : [tasks];
        
    } catch (error) {
        console.error('Failed to parse tasks from AI response:', error);
        console.error('AI Response was:', aiResponse);
        throw new Error('Failed to generate tasks from AI response');
    }
}

