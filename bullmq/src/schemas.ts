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
    agentType: z.enum(['ACTION_SCOUT', 'BROWSER_AUTOMATION', 'SEARCH_AGENT', 'PLEX_AGENT', 'RESEARCH_AGENT', 'SUMMARY_AGENT']),
    taskType: z.enum(['SINGLE_RUN', 'CONTINUOUSLY_RUNNING', 'RUN_ON_CONDITION', 'THINKING_RESEARCH', 'FAILED_TASK_RECOVERY']),
    condition: z.any().optional(),
    resultData: z.any().optional(),
    userId: z.string(),
    scoutId: z.string(),
    
    // Browser-scout fields
    goTo: z.array(z.string()).optional(),
    search: z.array(z.string()).optional(),
    actions: z.array(actionSchema).optional().or(z.null()),
    
    // Notification frequency
    notificationFrequency: z.enum(['EVERY_HOUR', 'ONCE_A_DAY', 'ONCE_A_WEEK', 'AI_DECIDE']).optional()
});

// Type for the task
export type CompleteTask = z.infer<typeof completeTaskSchema>;
