import { Worker } from 'bullmq';
import { GeneralScoutAgent } from './generalAgent.js';
import { generalScoutTask } from './schemas/types.js';
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
    
    try {
        // Validate the job data
        const validatedData = generalScoutTask.parse(job.data);
        
        // Process the job using GeneralScoutAgent
        const result = await GeneralScoutAgent.processJob(validatedData);
        
        console.log(`Job ${job.id} completed successfully`);
        return result;
        
    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
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