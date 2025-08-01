# ScoutsAI

OpenScouts like yutori_ai scouts but OSS.

## Architecture Overview

ScoutsAI is built as a microservices architecture with four main components:

- **AI Worker**: Cloudflare Workers-based AI processing service
- **Browser Scout**: Browser automation engine using Stagehand
- **BullMQ Service**: Queue management and job processing
- **Scouts UI**: Next.js-based user interface

## Services

### AI Worker (`/ai-worker`)

A Cloudflare Workers service that handles AI processing tasks and email notifications.

**Features:**
- Task processing endpoints
- Email notification system
- Health check monitoring
- Cloudflare Workers deployment

**Setup:**
```bash
cd ai-worker
npm install
npm run dev
```

**Deployment:**
```bash
npm run deploy
```

**Endpoints:**
- `GET /health` - Service health check
- `POST /task` - Process AI tasks
- `POST /email` - Send email notifications

### Browser Scout (`/browser-scout`)

A browser automation service using Stagehand for AI-powered web interactions.

**Features:**
- Queue-based job processing with BullMQ
- Flexible action sequences (act, observe, extract)
- Stagehand-powered browser automation
- TypeScript-based type safety
- Comprehensive error handling and logging

**Setup:**
```bash
cd browser-scout
npm install
```

**Environment Variables:**
```env
OPENAI_API_KEY=your_openai_api_key
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_project_id
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

**Usage:**
```bash
# Start the worker
npm start
# or
npm run worker
```

**Job Schema:**
```typescript
{
    goTo: string[],           // URLs to navigate to
    search: string[],          // Search terms
    actions: Action[]          // Array of actions to perform
}

interface Action {
    type: "act" | "observe" | "extract";
    description: string;
}
```

**Example Job:**
```typescript
const jobData = {
    goTo: ["https://amazon.com"],
    search: ["laptop computers"],
    actions: [
        { type: "act", description: "Click the search box" },
        { type: "act", description: "Type 'laptop computers'" },
        { type: "observe", description: "Wait for search results" },
        { type: "extract", description: "Get first 5 product titles and prices" }
    ]
};
```

### BullMQ Service (`/bullmq`)

A queue management service built with Express and BullMQ for job processing.

**Features:**
- RESTful API for queue management
- Job status monitoring
- Redis-based job persistence
- CORS support for cross-origin requests
- Comprehensive error handling

**Setup:**
```bash
cd bullmq
npm install
npm run dev
```

**Environment Variables:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
PORT=3001
```

**Endpoints:**
- `GET /health` - Service health check
- `POST /add-task` - Add job to queue
- `GET /queue-status` - Get queue statistics
- `GET /job/:jobId` - Get job details

**Job Types:**
- `BROWSER_AUTOMATION` - Browser automation tasks
- `SEARCH_AGENT` - Search agent tasks
- `PLEX_AGENT` - Plex agent tasks

### Scouts UI (`/scouts-ui`)

A modern Next.js user interface for interacting with the ScoutsAI platform.

**Features:**
- Modern React-based interface
- Tailwind CSS styling
- Framer Motion animations
- Radix UI components
- TypeScript support
- Prisma database integration

**Setup:**
```bash
cd scouts-ui
npm install
npm run dev
```

**Environment Variables:**
```env
DATABASE_URL=your_database_url
```

**Development:**
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run linting
```

## Development Workflow

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Redis** server running locally or remotely
3. **Environment variables** configured for each service

### Local Development

1. **Start Redis:**
```bash
redis-server
```

2. **Start BullMQ Service:**
```bash
cd bullmq
npm run dev
```

3. **Start Browser Scout Worker:**
```bash
cd browser-scout
npm start
```

4. **Start Scouts UI:**
```bash
cd scouts-ui
npm run dev
```

5. **Deploy AI Worker (optional for local development):**
```bash
cd ai-worker
npm run deploy
```

### Testing

Each service includes its own testing setup:

```bash
# AI Worker
cd ai-worker
npm test

# Browser Scout
cd browser-scout
npm run build

# BullMQ Service
cd bullmq
npm test

# Scouts UI
cd scouts-ui
npm run lint
```

## Deployment

### Production Setup

1. **Configure environment variables** for each service
2. **Set up Redis** in production environment
3. **Deploy AI Worker** to Cloudflare Workers
4. **Deploy BullMQ Service** to your preferred hosting platform
5. **Deploy Scouts UI** to Vercel or similar platform
6. **Configure Browser Scout** to run as a worker process

### Environment Configuration

Ensure all services have access to:
- Redis connection details
- OpenAI API keys
- Browserbase API keys (for browser automation)
- Database connection strings (for UI)

## API Integration

### Adding Jobs to Queue

```typescript
// Add browser automation job
const response = await fetch('http://localhost:3001/add-task', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        todoId: 'task-123',
        agentType: 'BROWSER_AUTOMATION',
        title: 'Amazon Product Search',
        data: {
            goTo: ['https://amazon.com'],
            search: ['laptop computers'],
            actions: [
                { type: 'act', description: 'Search for laptops' },
                { type: 'extract', description: 'Get product prices' }
            ]
        }
    })
});
```

### Monitoring Job Status

```typescript
// Check job status
const jobStatus = await fetch(`http://localhost:3001/job/${jobId}`);
const status = await jobStatus.json();

// Check queue status
const queueStatus = await fetch('http://localhost:3001/queue-status');
const queue = await queueStatus.json();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
1. Check the service-specific documentation
2. Review the logs for error details
3. Ensure all environment variables are properly configured
4. Verify Redis connection is working
