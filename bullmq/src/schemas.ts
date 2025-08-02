import { z } from 'zod';

// Action schema from browser-scout
export const actionSchema = z.object({
    type: z.enum(["act", "observe", "extract"]),
    description: z.string()
});

// Task schema
export const completeTaskSchema = z.object({
    // Original bullmq fields
    todoId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    agentType: z.enum(['BROWSER_AUTOMATION', 'SEARCH_AGENT', 'PLEX_AGENT']),
    taskType: z.enum(['SINGLE_RUN', 'CONTINUOUSLY_RUNNING', 'RUN_ON_CONDITION']),
    condition: z.any().optional(),
    resultData: z.any().optional(),
    userId: z.string(),
    scoutId: z.string(),
    
    // Browser-scout fields
    goTo: z.array(z.string()).optional(),
    search: z.array(z.string()).optional(),
    actions: z.array(actionSchema).optional()
});

// Type for the task
export type CompleteTask = z.infer<typeof completeTaskSchema>;
