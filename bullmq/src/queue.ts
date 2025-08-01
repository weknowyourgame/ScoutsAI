import { Queue } from 'bullmq';
import { CompleteTask } from './schemas';

// Connect Redis
export const jobsQueue = new Queue('stagehand-tasks', {
  connection: { 
    host: process.env.REDIS_HOST || 'localhost', 
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

// Test Redis connection
export async function testRedisConnection() {
  try {
    await (await jobsQueue.client).ping();
    console.log('Redis connection successful');
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error);
    return false;
  }
}

// Task data interface
export type StagehandTask = CompleteTask;

// Add a task to the queue
export async function addStagehandTask(taskData: StagehandTask) {
  return await jobsQueue.add('stagehand-task', taskData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
} 