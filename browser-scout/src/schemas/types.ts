import { z } from "zod";

// takes in the required goTo website along with a actions
// schema made by todo maker

/*
    example schema:
    {
        "goTo": ["https://www.google.com"],
        "search": ["Flights from NYC to LA"],
        "actions": [
            {
                "type": "act",
                "description": "Click the search button & search for flights from NYC to LA"
            },
            {
                "type": "observe", 
                "description": "Observe the search results"
            },
            {
                "type": "extract",
                "description": "Extract the search results"
            },
            {
                "type": "act",
                "description": "Click on the first result"
            },
            {
                "type": "observe",
                "description": "Observe the product details"
            },
            {
                "type": "extract",
                "description": "Extract price and availability"
            }
        ]
    }
*/

export const actionSchema = z.object({
    type: z.enum(["act", "observe", "extract"]),
    description: z.string()
});

// Old browser-scout task schema (for backward compatibility)
export const generalScoutTask = z.object({
    goTo: z.array(z.string()),
    search: z.array(z.string()),
    actions: z.array(actionSchema)
});

// Task schema
export const completeTaskSchema = z.object({
    todoId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    agentType: z.enum(['BROWSER_AUTOMATION', 'SEARCH_AGENT', 'PLEX_AGENT']),
    taskType: z.enum(['SINGLE_RUN', 'CONTINUOUSLY_RUNNING', 'RUN_ON_CONDITION']),
    condition: z.any().optional(),
    resultData: z.any().optional(),
    userId: z.string(),
    scoutId: z.string(),
    
    // Browser-scout fields
    goTo: z.array(z.string()).optional(),
    search: z.array(z.string()).optional(),
    actions: z.array(actionSchema).optional()
});

// Type for the complete task
export type CompleteTask = z.infer<typeof completeTaskSchema>;
