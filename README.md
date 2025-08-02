# ScoutsAI
OpenScouts like [yutori_ai](http://yutori.com/) scouts but OSS.

## Overview
<img width="1901" height="683" alt="Screenshot 2025-08-01 at 4 17 44 PM" src="https://github.com/user-attachments/assets/760c4783-da0b-4cde-93d4-64003c708221" />

ScoutsAI is a microservices-based architecture designed to handle intelligent web automation tasks. The platform processes natural language requests, converts them into structured browser automation tasks, and executes them through a distributed queue system.

## Architecture

ScoutsAI consists of four core services working in concert:

- **AI Worker**: Cloudflare Workers-based AI processing service
- **Browser Scout**: Browser automation engine using Stagehand
- **BullMQ Service**: Queue management and job processing
- **Scouts UI**: Next.js-based user interface

## Services

### AI Worker

A serverless AI processing service deployed on Cloudflare Workers that handles task interpretation and email notifications.

**Key Features:**
- Multi-provider AI model support (OpenAI, Groq, Perplexity, Google AI Studio)
- Natural language to structured task conversion
- Email notification system
- Edge computing deployment

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

**API Endpoints:**
- `GET /health` - Service health check
- `POST /task` - Process AI tasks
- `POST /email` - Send email notifications

### Browser Scout

A robust browser automation service that processes queued tasks using Stagehand for AI-powered web interactions.

**Key Features:**
- Queue-based job processing with BullMQ
- Flexible action sequences (act, observe, extract)
- Stagehand-powered browser automation
- Comprehensive error handling and logging
- TypeScript-based type safety

**Setup:**
```bash
cd browser-scout
npm install
```

**Environment Configuration:**
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
npm start
```

**Task Schema:**
```typescript
interface Task {
    goTo: string[];           // URLs to navigate to
    search: string[];          // Search terms
    actions: Action[];         // Array of actions to perform
}

interface Action {
    type: "act" | "observe" | "extract";
    description: string;
}
```

**Example Task:**
```typescript
const task = {
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

### BullMQ Service

A queue management service built with Express and BullMQ for reliable job processing and distribution.

**Key Features:**
- RESTful API for queue management
- Job status monitoring and tracking
- Redis-based job persistence
- CORS support for cross-origin requests
- Comprehensive error handling and validation

**Setup:**
```bash
cd bullmq
npm install
npm run dev
```

**Environment Configuration:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
PORT=3001
```

**API Endpoints:**
- `GET /health` - Service health check
- `POST /add-task` - Add job to queue
- `GET /queue-status` - Get queue statistics
- `GET /job/:jobId` - Get job details

**Supported Agent Types:**
- `BROWSER_AUTOMATION` - Browser automation tasks
- `SEARCH_AGENT` - Search agent tasks
- `PLEX_AGENT` - Plex agent tasks

### Scouts UI

A modern Next.js user interface providing an intuitive way to interact with the ScoutsAI platform.

**Key Features:**
- Modern React-based interface with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI components
- Prisma database integration
- Real-time task monitoring

**Setup:**
```bash
cd scouts-ui
npm install
npm run dev
```

**Environment Configuration:**
```env
DATABASE_URL=your_database_url
```

**Development Commands:**
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run linting
```

## Data Flow

1. **User Input**: Natural language request submitted through Scouts UI
2. **AI Processing**: AI Worker converts request to structured task
3. **Queue Management**: BullMQ Service validates and queues the task
4. **Browser Automation**: Browser Scout processes the task using Stagehand
5. **Results**: Extracted data is stored and displayed in the UI

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- Redis server (local or remote)
- Environment variables configured for each service

### Local Development

1. **Start Redis Server:**
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

Each service includes comprehensive testing:

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

## API Integration

### Adding Tasks to Queue

```typescript
const response = await fetch('http://localhost:3001/add-task', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        todoId: 'task-123',
        agentType: 'BROWSER_AUTOMATION',
        title: 'Amazon Product Search',
        userId: 'user-123',
        scoutId: 'scout-456',
        goTo: ['https://amazon.com'],
        search: ['laptop computers'],
        actions: [
            { type: 'act', description: 'Search for laptops' },
            { type: 'extract', description: 'Get product prices' }
        ]
    })
});
```

### Monitoring Task Status

```typescript
// Check task status
const taskStatus = await fetch(`http://localhost:3001/job/${jobId}`);
const status = await taskStatus.json();

// Check queue status
const queueStatus = await fetch('http://localhost:3001/queue-status');
const queue = await queueStatus.json();
```

## Production Deployment

### Environment Configuration

Ensure all services have access to:
- Redis connection details
- OpenAI API keys
- Browserbase API keys (for browser automation)
- Database connection strings (for UI)

### Deployment Steps

1. Configure environment variables for each service
2. Set up Redis in production environment
3. Deploy AI Worker to Cloudflare Workers
4. Deploy BullMQ Service to your preferred hosting platform
5. Deploy Scouts UI to Vercel or similar platform
6. Configure Browser Scout to run as a worker process

## Database Schema

The platform uses PostgreSQL with Prisma ORM for data persistence:

```sql
-- Core entities
User → Scout → Todo → Log/Summary

-- Key models
- User: User management and authentication
- Scout: Individual scout requests from users
- Todo: Specific tasks within a scout
- Log: Execution logs and debugging information
- Summary: Extracted data and results
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For technical support and issues:

1. Review service-specific documentation
2. Check application logs for error details
3. Verify environment variables are properly configured
4. Ensure Redis connection is working correctly
5. Test individual service health endpoints

## Roadmap

- Enhanced AI model support
- Advanced browser automation capabilities
- Real-time collaboration features
- Mobile application
- Enterprise features and integrations
