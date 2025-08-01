import { generalScoutTask } from "./schemas/types";


class generalScoutAgent(task: generalScoutTask) {
    const { goTo, search, action } = task;

    // go to the website
    await page.goto(goTo);

    // search the website
    await page.search(search);
}