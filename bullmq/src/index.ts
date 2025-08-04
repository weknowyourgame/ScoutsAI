import express from 'express';
import cors from 'cors';
import { jobsQueue, addStagehandTask, StagehandTask, testRedisConnection } from './queue';
import { completeTaskSchema } from './schemas';
import './worker'; // Start the worker

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add a task to the queue
app.post('/add-task', async (req, res) => {
  try {
    const jobData: StagehandTask = req.body;

    // Validate required fields
    if (!jobData.todoId || !jobData.agentType || !jobData.title) {
      return res.status(400).json({ 
        error: 'Missing required fields: todoId, agentType, title' 
      });
    }

    // Validate agentType
    const validAgentTypes = ['BROWSER_AUTOMATION', 'SEARCH_AGENT', 'PLEX_AGENT', 'RESEARCH_AGENT', 'ACTION_SCOUT', 'SUMMARY_AGENT'];
    if (!validAgentTypes.includes(jobData.agentType)) {
      return res.status(400).json({ 
        error: `Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}` 
      });
    }

    // Validate task schema
    try {
      completeTaskSchema.parse(jobData);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid task data',
        details: error instanceof Error ? error.message : 'Unknown validation error'
      });
    }

    // Add job to queue
    const job = await addStagehandTask(jobData);
    
    console.log(`Task added to queue: ${job.id}`, {
      todoId: jobData.todoId,
      agentType: jobData.agentType,
      title: jobData.title,
      goTo: jobData.goTo,
      search: jobData.search,
      actionsCount: jobData.actions?.length || 0
    });

    return res.json({ 
      success: true,
      jobId: job.id,
      message: 'Task added to queue successfully'
    });

  } catch (err) {
    console.error('Failed to add job:', err);
    
    // Check if it's a Redis connection error
    if (err instanceof Error && err.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'Redis connection failed. Please check if Redis is running.'
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Get queue status
app.get('/queue-status', async (req, res) => {
  try {
    const waiting = await jobsQueue.getWaiting();
    const active = await jobsQueue.getActive();
    const completed = await jobsQueue.getCompleted();
    const failed = await jobsQueue.getFailed();

    res.json({
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length
    });
  } catch (err) {
    console.error('Failed to get queue status:', err);
    res.status(500).json({ error: 'Failed to get queue status' });
  }
});

// Get job by ID
app.get('/job/:jobId', async (req, res) => {
  try {
    const job = await jobsQueue.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress ? await job.progress() : 0;
    const result = await job.returnvalue;

    res.json({
      id: job.id,
      state,
      progress,
      result,
      data: job.data
    });
  } catch (err) {
    console.error('Failed to get job:', err);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

const PORT = process.env.PORT || 3001;

// Start server with Redis check
async function startServer() {
  // Test Redis connection first
  const redisConnected = await testRedisConnection();
  
  if (!redisConnected) {
    console.error('Cannot start server: Redis connection failed');
    console.log('Please start Redis or check your Redis configuration');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Queue API Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Add tasks: POST http://localhost:${PORT}/add-task`);
    console.log(`Queue status: GET http://localhost:${PORT}/queue-status`);
  });
}

startServer().catch(console.error); 