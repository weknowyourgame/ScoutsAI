# Queue API Service

A simple HTTP API service that accepts tasks and adds them to a BullMQ queue for processing by `@/browser-scout`.


## API Endpoints

### Health Check
```
GET /health
```
Returns service status and timestamp.

### Add Task
```
POST /add-task
```
Adds a new task to the queue.

**Request Body:**
```json
{
  "todoId": "todo-uuid",
  "title": "Search flights LA to NYC",
  "description": "Find flights under $500",
  "agentType": "BROWSER_AUTOMATION",
  "taskType": "SINGLE_RUN",
  "condition": {
    "from": "LA",
    "to": "NYC",
    "maxPrice": 500
  },
  "userId": "user-uuid",
  "scoutId": "scout-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "job-uuid",
  "message": "Task added to queue successfully"
}
```

### Queue Status
```
GET /queue-status
```
Returns current queue statistics.

### Get Job
```
GET /job/:jobId
```
Returns job details by ID.

## Environment Variables

- `PORT` - Server port (default: 3001)
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
