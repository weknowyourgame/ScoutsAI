import { generalScoutTask } from "./schemas/types";
import { generalScoutParser } from "./utils/generalAgent";
import { StagehandExecutor } from "./utils/stagehand-executor.js";
import { z } from "zod";

export class GeneralScoutAgent {
    private task: z.infer<typeof generalScoutTask>;
    private executor: StagehandExecutor;

    constructor(task: z.infer<typeof generalScoutTask>) {
        this.task = task;
        this.executor = new StagehandExecutor();
    }

    async parseTask() {
        const parsedTask = await generalScoutParser(this.task);
        console.log("Parsed Task:", parsedTask);
        return parsedTask;
    }

    async executeTask() {
        console.log("Starting task execution...");
        const result = await this.executor.executeTask(this.task);
        console.log("Task execution result:", result);
        return result;
    }

    async run() {
        // Parse the task
        await this.parseTask();
        
        // Execute the task
        return await this.executeTask();
    }

    // Method to handle BullMQ job data
    static async processJob(jobData: any) {
        try {
            // Validate the job data against our schema
            const validatedTask = generalScoutTask.parse(jobData);
            
            // Create agent instance
            const agent = new GeneralScoutAgent(validatedTask);
            
            // Run the task
            const result = await agent.run();
            
            return {
                success: true,
                result: result,
                jobId: jobData.jobId || 'unknown'
            };
        } catch (error) {
            console.error("Job processing failed:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                jobId: jobData.jobId || 'unknown'
            };
        }
    }
}