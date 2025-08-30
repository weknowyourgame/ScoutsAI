"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsQueue = void 0;
exports.testRedisConnection = testRedisConnection;
exports.addStagehandTask = addStagehandTask;
const bullmq_1 = require("bullmq");
// Connect Redis
exports.jobsQueue = new bullmq_1.Queue('stagehand-tasks', {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
    }
});
// Test Redis connection
async function testRedisConnection() {
    try {
        await (await exports.jobsQueue.client).ping();
        console.log('Redis connection successful');
        return true;
    }
    catch (error) {
        console.error('Redis connection failed:', error);
        return false;
    }
}
// Add a task to the queue
async function addStagehandTask(taskData) {
    return await exports.jobsQueue.add('stagehand-task', taskData, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
    });
}
//# sourceMappingURL=queue.js.map