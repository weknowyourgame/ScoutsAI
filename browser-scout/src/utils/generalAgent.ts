import { generalScoutTask } from "../schemas/types";

/*
    example schema:
    {
        "goTo": ["https://www.google.com"],
        "search": ["Flights from NYC to LA"],
        "action": {
            "act": "Click the search button & search for flights from NYC to LA",
            "observe": "Observe the search results",              // General logs for DB
            "extract": "Extract the search results"
        }
    }
*/
export async function generalScoutParser(task: generalScoutTask) {
    const { goTo, search, action } = task;

    // go to the website
    await page.goto(goTo);

    // search the website
    await page.search(search);
}