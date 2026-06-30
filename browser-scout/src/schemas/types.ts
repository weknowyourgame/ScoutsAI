import { z } from "zod";

export const actionSchema = z.object({
  type: z.enum(["act", "observe", "extract"]),
  description: z.string(),
});

export const generalScoutTask = z.object({
  goTo: z.array(z.string()).default([]),
  search: z.array(z.string()).default([]),
  actions: z.array(actionSchema).default([]),
});

export const completeTaskSchema = z.object({
  todoId: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  agentType: z.enum([
    "ACTION_SCOUT",
    "BROWSER_AUTOMATION",
    "SEARCH_AGENT",
    "PLEX_AGENT",
    "RESEARCH_AGENT",
    "SUMMARY_AGENT",
  ]),
  taskType: z.enum([
    "SINGLE_RUN",
    "CONTINUOUSLY_RUNNING",
    "RUN_ON_CONDITION",
    "THINKING_RESEARCH",
    "FAILED_TASK_RECOVERY",
  ]),
  condition: z.any().optional().nullable(),
  resultData: z.any().optional(),
  userId: z.string(),
  scoutId: z.string(),
  scheduledFor: z.string().optional().nullable(),
  goTo: z.array(z.string()).optional().default([]),
  search: z.array(z.string()).optional().default([]),
  actions: z.array(actionSchema).optional().nullable().default([]),
  notificationFrequency: z.enum(["EVERY_HOUR", "ONCE_A_DAY", "ONCE_A_WEEK", "AI_DECIDE"]).optional(),
});

export type CompleteTask = z.infer<typeof completeTaskSchema>;
