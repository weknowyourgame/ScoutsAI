"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTaskSchema = exports.actionSchema = void 0;
const zod_1 = require("zod");
// Action schema from browser-scout
exports.actionSchema = zod_1.z.object({
    type: zod_1.z.enum(["act", "observe", "extract"]),
    description: zod_1.z.string()
});
// Task schema
exports.completeTaskSchema = zod_1.z.object({
    // Original bullmq fields
    todoId: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    agentType: zod_1.z.enum(['ACTION_SCOUT', 'BROWSER_AUTOMATION', 'SEARCH_AGENT', 'PLEX_AGENT', 'RESEARCH_AGENT', 'SUMMARY_AGENT']),
    taskType: zod_1.z.enum(['SINGLE_RUN', 'CONTINUOUSLY_RUNNING', 'RUN_ON_CONDITION', 'THINKING_RESEARCH', 'FAILED_TASK_RECOVERY']),
    condition: zod_1.z.any().optional(),
    resultData: zod_1.z.any().optional(),
    userId: zod_1.z.string(),
    scoutId: zod_1.z.string(),
    // Browser-scout fields
    goTo: zod_1.z.array(zod_1.z.string()).optional(),
    search: zod_1.z.array(zod_1.z.string()).optional(),
    actions: zod_1.z.array(exports.actionSchema).optional().or(zod_1.z.null()),
    // Notification frequency
    notificationFrequency: zod_1.z.enum(['EVERY_HOUR', 'ONCE_A_DAY', 'ONCE_A_WEEK', 'AI_DECIDE']).optional()
});
//# sourceMappingURL=schemas.js.map