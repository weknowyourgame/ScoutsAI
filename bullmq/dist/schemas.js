"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTaskSchema = exports.actionSchema = void 0;
const zod_1 = require("zod");
exports.actionSchema = zod_1.z.object({
    type: zod_1.z.enum(['act', 'observe', 'extract']),
    description: zod_1.z.string(),
});
exports.completeTaskSchema = zod_1.z.object({
    todoId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional().nullable(),
    agentType: zod_1.z.enum([
        'ACTION_SCOUT',
        'BROWSER_AUTOMATION',
        'SEARCH_AGENT',
        'PLEX_AGENT',
        'RESEARCH_AGENT',
        'SUMMARY_AGENT',
    ]),
    taskType: zod_1.z.enum([
        'SINGLE_RUN',
        'CONTINUOUSLY_RUNNING',
        'RUN_ON_CONDITION',
        'THINKING_RESEARCH',
        'FAILED_TASK_RECOVERY',
    ]),
    condition: zod_1.z.any().optional().nullable(),
    resultData: zod_1.z.any().optional(),
    userId: zod_1.z.string(),
    scoutId: zod_1.z.string(),
    scheduledFor: zod_1.z.string().optional().nullable(),
    goTo: zod_1.z.array(zod_1.z.string()).optional().default([]),
    search: zod_1.z.array(zod_1.z.string()).optional().default([]),
    actions: zod_1.z.array(exports.actionSchema).optional().nullable().default([]),
    notificationFrequency: zod_1.z.enum(['EVERY_HOUR', 'ONCE_A_DAY', 'ONCE_A_WEEK', 'AI_DECIDE']).optional(),
});
//# sourceMappingURL=schemas.js.map