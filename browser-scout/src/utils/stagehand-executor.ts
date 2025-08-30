import { Stagehand, Page } from "@browserbasehq/stagehand";
import StagehandConfig from "../../stagehand.config.ts";
import { completeTaskSchema } from "../schemas/types";
import { z } from "zod";

export class StagehandExecutor {
    private stagehand: Stagehand;
    private page: Page;
    private logs: string[] = [];

    constructor() {
        this.stagehand = new Stagehand(StagehandConfig);
        this.logs = [];
    }

    private log(message: string) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        this.logs.push(logMessage);
        console.log(logMessage);
    }

    async executeTask(task: z.infer<typeof completeTaskSchema>) {
        try {
            this.log("Starting Stagehand execution");
            this.log(`Notification frequency: ${task.notificationFrequency || 'ONCE_A_DAY'}`);
            
            // Initialize Stagehand
            await this.stagehand.init();
            this.page = this.stagehand.page;
            this.log("Stagehand initialized");

            // Execute the task plan
            const result = await this.executePlan(task);
            
            this.log("Task completed successfully");
            return {
                success: true,
                data: result,
                logs: this.logs
            };

        } catch (error) {
            this.log(`Task failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                logs: this.logs
            };
        } finally {
            if (this.stagehand) {
                await this.stagehand.close();
                this.log("Stagehand closed");
            }
        }
    }

    private async executePlan(task: z.infer<typeof completeTaskSchema>) {
        const results = {
            navigation: [] as string[],
            searches: [] as string[],
            actions: [] as any[],
            extractedData: [] as any[]
        };

        // If no specific actions are defined, try to perform a basic search
        if ((!task.goTo || task.goTo.length === 0) && (!task.search || task.search.length === 0) && (!task.actions || task.actions.length === 0)) {
            this.log("No specific actions defined, performing basic search");
            
            // Navigate to Google and perform a search based on the task title
            await this.page.goto("https://www.google.com");
            await this.page.waitForTimeout(2000);
            
            const searchQuery = task.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').slice(-3).join(' ');
            this.log(`Performing basic search for: ${searchQuery}`);
            
            await this.page.act(`Search for "${searchQuery}"`);
            await this.page.waitForTimeout(3000);
            
            // Extract basic search results
            try {
                const searchResults = await this.page.extract({
                    instruction: "Extract the first 5 search results with titles and links",
                    schema: z.object({
                        results: z.array(z.object({
                            title: z.string().optional(),
                            link: z.string().optional(),
                            snippet: z.string().optional()
                        }))
                    })
                });
                
                results.extractedData.push({
                    actionIndex: 0,
                    description: "Basic search results",
                    data: searchResults
                });
                
                this.log("Basic search completed successfully");
            } catch (error) {
                this.log(`Basic search extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            
            return results;
        }

        // Navigate to websites
        for (const website of task.goTo || []) {
            this.log(`Navigating to: ${website}`);
            await this.page.goto(website);
            await this.page.waitForTimeout(2000); // Wait for page load
            results.navigation.push(website);
        }

        // Perform searches if specified
        for (const searchTerm of task.search || []) {
            this.log(`Searching for: ${searchTerm}`);
            await this.page.act(`Search for "${searchTerm}"`);
            await this.page.waitForTimeout(2000);
            results.searches.push(searchTerm);
        }

        // Execute actions in sequence
        for (let i = 0; i < (task.actions?.length || 0); i++) {
            const action = task.actions![i];
            this.log(`Executing action ${i + 1}/${task.actions?.length || 0}: ${action.type} - ${action.description}`);
            
            try {
                switch (action.type) {
                    case "act":
                        await this.page.act(action.description);
                        await this.page.waitForTimeout(2000); // Wait for action to complete
                        results.actions.push({
                            type: "act",
                            description: action.description,
                            status: "completed"
                        });
                        break;
                        
                    case "observe":
                        const [observeResult] = await this.page.observe(action.description);
                        results.actions.push({
                            type: "observe",
                            description: action.description,
                            result: observeResult,
                            status: "completed"
                        });
                        break;
                        
                    case "extract":
                        const extractedData = await this.page.extract({
                            instruction: action.description,
                            schema: z.object({
                                results: z.array(z.object({
                                    title: z.string().optional(),
                                    content: z.string().optional(),
                                    price: z.string().optional(),
                                    link: z.string().optional(),
                                    
                                    // more fields to be added
                                    // @ts-ignore
                                    [z.string()]: z.any().optional() // Allow dynamic fields
                                }))
                            })
                        });
                        results.extractedData.push({
                            actionIndex: i,
                            description: action.description,
                            data: extractedData
                        });
                        results.actions.push({
                            type: "extract",
                            description: action.description,
                            data: extractedData,
                            status: "completed"
                        });
                        break;
                        
                    default:
                        this.log(`Unknown action type: ${action.type}`);
                        results.actions.push({
                            type: action.type,
                            description: action.description,
                            status: "failed",
                            error: `Unknown action type: ${action.type}`
                        });
                }
            } catch (error) {
                this.log(`Action ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                results.actions.push({
                    type: action.type,
                    description: action.description,
                    status: "failed",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        this.log(`Completed ${task.actions?.length || 0} actions`);
        return results;
    }
} 