import { Stagehand, Page, BrowserContext } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.js";
import chalk from "chalk";
import boxen from "boxen";
import { drawObserveOverlay, clearOverlays, actWithCache } from "./utils.js";
import { z } from "zod";

async function main({
  page,
  context,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  context: BrowserContext; // Playwright BrowserContext
  stagehand: Stagehand; // Stagehand instance
}) {
  // Navigate to a URL
  await page.goto("https://docs.stagehand.dev/reference/introduction");

  // Use act() to take actions on the page
  await page.act("Click the search box");

  // Use observe() to plan an action before doing it
  const [action] = await page.observe(
    "Type 'Tell me in one sentence why I should use Stagehand' into the search box",
  );
  await drawObserveOverlay(page, [action]); // Highlight the search box
  await page.waitForTimeout(1_000);
  await clearOverlays(page); // Remove the highlight before typing
  await page.act(action); // Take the action

  // For more on caching, check out our docs: https://docs.stagehand.dev/examples/caching
  await page.waitForTimeout(1_000);
  await actWithCache(page, "Click the suggestion to use AI");
  await page.waitForTimeout(5_000);

  // Use extract() to extract structured data from the page
  const { text } = await page.extract({
    instruction:
      "extract the text of the AI suggestion from the search results",
    schema: z.object({
      text: z.string(),
    }),
  });
  stagehand.log({
    category: "create-browser-app",
    message: `Got AI Suggestion`,
    auxiliary: {
      text: {
        value: text,
        type: "string",
      },
    },
  });
  stagehand.log({
    category: "create-browser-app",
    message: `Metrics`,
    auxiliary: {
      metrics: {
        value: JSON.stringify(stagehand.metrics),
        type: "object",
      },
    },
  });
}

/**
 * This is the main function that runs when you do npm run start
 *
 * DON'T NEED TO MODIFY ANYTHING BELOW THIS POINT!
 *
 */
async function run() {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  if (StagehandConfig.env === "BROWSERBASE" && stagehand.browserbaseSessionID) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`,
        )}`,
        {
          title: "Browserbase",
          padding: 1,
          margin: 3,
        },
      ),
    );
  }

  const page = stagehand.page;
  const context = stagehand.context;
  await main({
    page,
    context,
    stagehand,
  });
  await stagehand.close();
  console.log("Stagehand closed");
}

run();
