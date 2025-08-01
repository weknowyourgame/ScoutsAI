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

export const generalScoutTask = z.object({
    goTo: z.array(z.string()),
    search: z.array(z.string()),
    actions: z.array(actionSchema)
});
