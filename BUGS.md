# ScoutsAI Bug Inventory

## High-Level Status

This repo is a four-service TypeScript app:

- `scouts-ui`: Next.js 15 + React 19 frontend/API routes.
- `ai-worker`: Cloudflare Worker using Hono, Cloudflare AI Gateway, Groq, Perplexity, Gemini/Google AI Studio, Workers AI, and Resend.
- `bullmq`: Express + BullMQ + Redis queue API/worker.
- `browser-scout`: Stagehand + Browserbase/Playwright browser automation.
- Database: PostgreSQL through Prisma.

No package currently has `node_modules` installed, so builds and runtime checks cannot complete until dependencies are installed.

## What Appears To Work

- Basic architecture is understandable.
- Scout creation flow exists: UI -> `/api/scouts` -> database.
- Task generation flow exists: UI -> Next API -> AI worker.
- Queueing flow exists: Next API -> BullMQ service -> Redis.
- Browser automation path exists: BullMQ -> browser-scout `/execute`.
- Email path exists: BullMQ -> AI worker `/email` -> Resend.
- Prisma models mostly line up between `scouts-ui` and `bullmq`.

## Critical Bugs

- Dependencies are not installed in any service, so nothing can currently build or run.
- `browser-scout/package.json` does not list `express` or `cors`, but `browser-scout/src/index.ts` imports both.
- `browser-scout` has two HTTP server entrypoints: `src/index.ts` and `src/server.ts`. `npm start` uses `src/server.ts`, making `src/index.ts` confusing/dead unless manually run.
- `browser-scout` has its own BullMQ worker consuming `stagehand-tasks`, while `bullmq` also consumes the same queue. If both run, jobs can be taken by the wrong worker.
- `browser-scout` and `bullmq` task schemas have drifted. `browser-scout` only supports `BROWSER_AUTOMATION`, `SEARCH_AGENT`, and `PLEX_AGENT`, while `bullmq` supports `ACTION_SCOUT`, `BROWSER_AUTOMATION`, `SEARCH_AGENT`, `PLEX_AGENT`, `RESEARCH_AGENT`, and `SUMMARY_AGENT`.
- `browser-scout` task schema only supports `SINGLE_RUN`, `CONTINUOUSLY_RUNNING`, and `RUN_ON_CONDITION`, while the DB/BullMQ also use `THINKING_RESEARCH` and `FAILED_TASK_RECOVERY`.
- Prisma schemas are duplicated across services and already differ.
- `scouts-ui` and `bullmq` allow nullable `Log.todoId` and `Summary.todoId`, while `browser-scout` and `ai-worker` require them.
- Final summaries rely on `todoId: null`, so services with non-null `Summary.todoId` are incompatible.
- `Summary.userId` is required, but the relation uses `onDelete: SetNull`, which is inconsistent because the field cannot be set to null.
- There are no visible Prisma migrations, so actual DB state may not match any schema.

## Frontend Bugs

- User identity is hardcoded as `temp-user-id` in `scouts-ui/app/page.tsx`.
- User identity is also hardcoded as `temp-user-id` in `scouts-ui/app/api/generate-tasks/route.ts`.
- There is no real auth/session flow.
- `generate-tasks` stores todos and then immediately queues them.
- `page.tsx` calls `/api/queue-todos` again after `generate-tasks`, so the same scout can be queued twice.
- Sidebar only reloads on mount or manual refresh, so newly created scouts may not appear immediately.
- Errors are mostly logged to console instead of shown in the UI.
- `AiInput` sends analyze requests after every short debounce while typing, which can burn API credits quickly.
- Notification frequency mapping is duplicated in UI and API code.
- `ScoutChat` displays raw `JSON.stringify(resultData)` instead of a readable result view.
- `app/api/process-todo/route.ts` returns `410 Gone` but still contains lots of old unused processing code.

## Queue And Worker Bugs

- `bullmq/src/index.ts` imports `./worker`, so starting the queue API also starts a worker in the same process.
- `queue-todos` sets todos to `IN_PROGRESS` immediately after queueing. If the worker never runs, todos stay stuck.
- Failed queue attempts are logged but do not update the todo to `FAILED`.
- `queue-todos` does not pass `notificationFrequency`, while old `queue-tasks` does. Email frequency can silently default wrong.
- BullMQ jobs use `removeOnComplete.age: 10`, so completed jobs disappear after about 10 seconds.
- BullMQ jobs use `removeOnFail.age: 5`, so failed jobs disappear after about 5 seconds.
- Retry cleanup resets failed todos to `PENDING` but does not clearly increment retry count there.
- Worker result/status transitions create very limited durable logs, making debugging hard.
- `scheduledFor` is sent to BullMQ but is not in the BullMQ Zod schema, so it may be stripped/ignored.

## Browser Automation Bugs

- Stagehand config silently uses empty strings when API keys are missing.
- Missing `OPENAI_API_KEY`, `BROWSERBASE_API_KEY`, or `BROWSERBASE_PROJECT_ID` will likely fail later with unclear errors.
- `StagehandExecutor` declares `private page: Page` without initializing it.
- `StagehandExecutor` has questionable dynamic Zod syntax in the extract schema: `[z.string()]: z.any().optional()`.
- `GeneralScoutAgent.parseTask()` calls the parser but discards the parsed task plan.
- Browser automation executes the original task, not the parsed plan.
- Browser search fallback always uses Google and a naive search query derived from the task title.
- Browser actions use fixed sleeps instead of robust waits.
- `browser-scout/src/worker.ts` updates task status through the Next API, while the `bullmq` worker updates Prisma directly. These are two competing patterns.

## AI Worker Bugs

- `ai-worker/src/fetchers.ts` imports `storeTasksInDatabase` but does not use it.
- AI worker includes Prisma code/dependency, but Prisma on Cloudflare Workers needs careful runtime support and may not work as written.
- Task generation parses LLM output with regex instead of guaranteed structured output.
- If the AI returns only one task, task generation fails even if that task is valid.
- Generated tasks are not validated against the DB/task schema before being stored.
- `analyzeRequest` has no try/catch, unlike `taskFetcher`.
- Missing env vars such as `GROQ_API_KEY`, `PERPLEXITY_API_KEY`, `GOOGLE_AI_STUDIO_API_KEY`, `CLOUDFLARE_API_TOKEN`, or `ACCOUNT_ID` cause hard failures.
- Cloudflare AI Gateway name `ai-worker-scouts` is hardcoded.
- Provider/model compatibility is not strongly validated.

## Email Bugs

- Email sending depends on `RESEND_API_KEY` and `RESEND_FROM`, but missing env vars are not checked early.
- LLM-generated HTML is sent directly as email content.
- Email lookup depends on `todo.userId`, but users are hardcoded.
- Email send success/failure logs may fail if Prisma schema expects non-null `todoId` in a service using the older schema.

## Config And Dev Experience Bugs

- Mixed package-manager state: npm lockfiles exist, `browser-scout` also has `bun.lock`, and its package metadata says pnpm.
- README says to use `npm install`, while `browser-scout` declares pnpm as package manager.
- Only `browser-scout` has an `.env.example`.
- `BULLMQ_URL` and `BULLMQ_API_URL` are both used in different places for similar meaning.
- `NEXT_PUBLIC_APP_URL` is used for server-side internal calls; this should likely be private `APP_URL`.
- No root workspace/package manager setup.
- No root command to run all services.
- No Docker Compose for Redis/Postgres.
- No tests.
- Next lint script uses `next lint`, which may be incompatible with newer Next versions.

## Dead Or Confusing Code

- `browser-scout/src/index.ts` appears unused by the package start script.
- `browser-scout/src/worker.ts` competes with `bullmq/src/worker.ts`.
- `scouts-ui/app/api/process-todo/route.ts` is deprecated but still contains old implementation code.
- `scouts-ui/app/api/queue-tasks/route.ts` overlaps heavily with `queue-todos`.
- `ai-worker/src/utils/database.ts` appears unused by current task generation flow.

## Suggested Fix Order

1. Pick one package manager and reinstall dependencies consistently.
2. Pick one queue consumer. Prefer keeping `bullmq` as the only worker and making `browser-scout` only an HTTP automation service.
3. Create one shared task schema and reuse it across UI, BullMQ, browser-scout, and AI worker.
4. Make one Prisma schema the source of truth and remove schema drift.
5. Fix nullable `todoId` fields for final summaries/logs.
6. Remove duplicate queueing in `page.tsx` / `generate-tasks`.
7. Replace hardcoded `temp-user-id` with real auth/user handling.
8. Add `.env.example` files for all services.
9. Add Docker Compose for Redis and Postgres.
10. Validate generated AI tasks before inserting into the database.
11. Replace regex JSON parsing with structured output/schema validation.
12. Delete deprecated/duplicate routes and unused worker/server files.
13. Add basic tests for task generation, queueing, status updates, and schema validation.
