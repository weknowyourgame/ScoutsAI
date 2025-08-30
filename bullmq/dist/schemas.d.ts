import { z } from 'zod';
export declare const actionSchema: z.ZodObject<{
    type: z.ZodEnum<{
        act: "act";
        observe: "observe";
        extract: "extract";
    }>;
    description: z.ZodString;
}, z.core.$strip>;
export declare const completeTaskSchema: z.ZodObject<{
    todoId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    agentType: z.ZodEnum<{
        ACTION_SCOUT: "ACTION_SCOUT";
        BROWSER_AUTOMATION: "BROWSER_AUTOMATION";
        SEARCH_AGENT: "SEARCH_AGENT";
        PLEX_AGENT: "PLEX_AGENT";
        RESEARCH_AGENT: "RESEARCH_AGENT";
        SUMMARY_AGENT: "SUMMARY_AGENT";
    }>;
    taskType: z.ZodEnum<{
        SINGLE_RUN: "SINGLE_RUN";
        CONTINUOUSLY_RUNNING: "CONTINUOUSLY_RUNNING";
        RUN_ON_CONDITION: "RUN_ON_CONDITION";
        THINKING_RESEARCH: "THINKING_RESEARCH";
        FAILED_TASK_RECOVERY: "FAILED_TASK_RECOVERY";
    }>;
    condition: z.ZodOptional<z.ZodAny>;
    resultData: z.ZodOptional<z.ZodAny>;
    userId: z.ZodString;
    scoutId: z.ZodString;
    goTo: z.ZodOptional<z.ZodArray<z.ZodString>>;
    search: z.ZodOptional<z.ZodArray<z.ZodString>>;
    actions: z.ZodUnion<[z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            act: "act";
            observe: "observe";
            extract: "extract";
        }>;
        description: z.ZodString;
    }, z.core.$strip>>>, z.ZodNull]>;
    notificationFrequency: z.ZodOptional<z.ZodEnum<{
        EVERY_HOUR: "EVERY_HOUR";
        ONCE_A_DAY: "ONCE_A_DAY";
        ONCE_A_WEEK: "ONCE_A_WEEK";
        AI_DECIDE: "AI_DECIDE";
    }>>;
}, z.core.$strip>;
export type CompleteTask = z.infer<typeof completeTaskSchema>;
//# sourceMappingURL=schemas.d.ts.map