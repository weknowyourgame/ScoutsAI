# Cloudflare Migration Notes

## Decisions

- Keep PostgreSQL and the existing Prisma schema untouched.
- Keep the current Next API routes as the owner of database writes for now.
- Move AI calls to the Stud-style pattern: OpenRouter as the model provider, optionally routed through Cloudflare AI Gateway.
- Replace BullMQ/Redis job production with Cloudflare Queues.
- Use the Worker queue consumer to execute queued todos and call the existing Next status API to update records.
- Use Cloudflare Cron Triggers to call the existing scheduler endpoint instead of running an external cron process.
- Keep `browser-scout` as a separate automation HTTP service for now. It can later move to Cloudflare Browser Rendering if Stagehand/browser requirements allow it.

## Current Cloudflare Mapping

| Responsibility | Old | New |
| --- | --- | --- |
| AI provider routing | Groq/Perplexity/Gemini-specific gateway calls | OpenRouter through optional Cloudflare AI Gateway |
| Background queue | Redis + BullMQ | Cloudflare Queues |
| Cron/scheduler | Next route/manual trigger | Cloudflare Cron Trigger calling `/api/scheduler` |
| Database | PostgreSQL + Prisma | Unchanged |
| Browser automation | Stagehand + Browserbase service | Unchanged for now; candidate for Browser Rendering later |
| Local dev user | Hardcoded `temp-user-id` | Browser localStorage test user |

## Environment Pattern

This follows Stud's model:

- `OPENROUTER_API_KEY` is required for model calls.
- `AI_GATEWAY_URL` is optional. When set, requests use `${AI_GATEWAY_URL}/openrouter/chat/completions`.
- `CLOUDFLARE_API_TOKEN` is only required if the Cloudflare AI Gateway requires authentication.
- Database credentials remain separate per app and should not be copied from Stud.
- Local Worker development uses `ai-worker/.dev.vars`, not `wrangler.jsonc` placeholder variables.

## Local Development

Run the three active services with Bun:

```bash
cd ai-worker
cp .dev.vars.example .dev.vars
bun run dev
```

```bash
cd scouts-ui
cp .env.example .env.local
bun run dev
```

```bash
cd browser-scout
bun run start
```

The frontend calls the Worker at `http://localhost:8787`. If the Worker, OpenRouter key, or local database is unavailable, the UI falls back to local development responses so the main create/list/status flow still works.

## Remaining Work

- Move final DB writes out of Next API only if a Cloudflare-compatible Prisma strategy is already approved.
- Remove BullMQ once Cloudflare Queue processing is verified.
- Remove old provider-specific AI env vars and code paths.
- Add tests for task generation, queue enqueue, queue consume, and status update callbacks.
