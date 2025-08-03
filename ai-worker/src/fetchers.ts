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
    const body = await c.req.json();
    const input = ReqSchema.parse(body);
    const response = await callGatewayAI(c.env, input);
    
    // @ts-ignore
    return c.json(response);
}

export async function emailNotifier(c: Context) {
    const body = await c.req.json();
    const input = emailReqSchema.parse(body);
    const response = await sendEmail(c, input);

    return c.json(response);
}

export async function analyzeRequest(c: Context) {
    const body = await c.req.json();
    
    const input = analyzeReqSchema.parse(body);
    
    const response = await callGatewayAI(c.env, input);
    console.log('Gateway response:', JSON.stringify(response, null, 2));

    return c.json(response);
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
        // Call AI to generate tasks
        const aiResponse = await callGatewayAI(env, {
            provider: input.provider,
            model_id: input.model_id,
            prompt: input.userQuery,
            system_prompt: todoMakerPrompt
        });

        // Parse the AI response to extract tasks
        const tasks = parseTasksFromAIResponse(aiResponse);
        
        return {
            success: true,
            scoutId: input.scoutId,
            tasksGenerated: tasks.length,
            tasks: tasks
        };
        
    } catch (error) {
        console.error('Task generation failed:', error);
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
            throw new Error('No content in AI response');
        }

        // Parse the JSON tasks from the content
        const tasksMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (!tasksMatch) {
            throw new Error('No JSON tasks found in AI response');
        }

        const tasksJson = tasksMatch[1];
        const tasks = JSON.parse(tasksJson);
        
        return Array.isArray(tasks) ? tasks : [tasks];
        
    } catch (error) {
        console.error('Failed to parse tasks from AI response:', error);
        // Return default tasks if parsing fails
        return generateDefaultTasks();
    }
}

function generateDefaultTasks() {
    return [
        {
            title: "Initial Research",
            description: "Research and gather initial information",
            agentType: "SEARCH_AGENT",
            taskType: "SINGLE_RUN"
        },
        {
            title: "Continuous Monitoring",
            description: "Monitor for updates and changes",
            agentType: "BROWSER_AUTOMATION",
            taskType: "CONTINUOUSLY_RUNNING"
        },
        {
            title: "Alert System",
            description: "Send notifications when conditions are met",
            agentType: "ACTION_SCOUT",
            taskType: "RUN_ON_CONDITION"
        }
    ];
}

