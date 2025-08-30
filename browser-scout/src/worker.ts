import { Worker } from 'bullmq';
import { GeneralScoutAgent } from './generalAgent.js';
import { completeTaskSchema } from './schemas/types.js';
import { z } from 'zod';

// Redis connection configuration
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
};

// Create worker to process browser scout jobs
const worker = new Worker('stagehand-tasks', async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    
    let validatedData: z.infer<typeof completeTaskSchema> | null = null;
    try {
        // Validate the job data
        validatedData = completeTaskSchema.parse(job.data);
        
        // Process the job using GeneralScoutAgent
        const result = await GeneralScoutAgent.processJob(validatedData);
        
        // Update the task status in database
        try {
            const updateResponse = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/update-task-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todoId: validatedData.todoId,
                    status: 'COMPLETED',
                    resultData: result
                })
            });
            
            if (updateResponse.ok) {
                console.log(`Task ${validatedData.todoId} status updated to COMPLETED`);
            } else {
                console.error(`Failed to update task ${validatedData.todoId} status`);
            }
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
        
        console.log(`Job ${job.id} completed successfully`);
        return result;
        
    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        
        // Update task status to FAILED
        try {
            const updateResponse = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/update-task-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todoId: (validatedData && validatedData.todoId) || job.data?.todoId || 'unknown',
                    status: 'FAILED',
                    resultData: { error: error instanceof Error ? error.message : 'Unknown error' }
                })
            });
            
            if (updateResponse.ok) {
                console.log(`Task ${validatedData && validatedData.todoId || job.data?.todoId || 'unknown'} status updated to FAILED`);
            } else {
                console.error(`Failed to update task ${validatedData && validatedData.todoId || job.data?.todoId || 'unknown'} status to FAILED`);
            }
        } catch (updateError) {
            console.error('Failed to update task status to FAILED:', updateError);
        }
        
        throw error;
    }
}, {
    connection,
    concurrency: 1, // Process one job at a time for browser automation
    removeOnComplete: {
        age: 10, // Keep last 10 completed jobs
        count: 10 // Keep last 10 completed jobs
    },
    removeOnFail: {
        age: 5, // Keep last 5 failed jobs
        count: 5 // Keep last 5 failed jobs
    }
});

// Handle worker events
worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
});

worker.on('failed', (job, err) => {
    // @ts-ignore
    console.error(`Job ${job.id} failed with error:`, err);
});

worker.on('error', (err) => {
    console.error('Worker error:', err);
});

console.log('Browser Scout Worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down worker...');
    await worker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down worker...');
    await worker.close();
    process.exit(0);
});

export default worker; 