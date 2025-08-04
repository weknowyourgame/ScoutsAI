import express from 'express';
import cors from 'cors';
import { GeneralScoutAgent } from './generalAgent.js';
import { completeTaskSchema } from './schemas/types.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Execute browser automation task
app.post('/execute', async (req, res) => {
  try {
    const taskData = req.body;
    
    console.log('Received browser automation task:', JSON.stringify(taskData, null, 2));
    
    // Validate the task data
    const validatedData = completeTaskSchema.parse(taskData);
    
    // Process the job using GeneralScoutAgent
    const result = await GeneralScoutAgent.processJob(validatedData);
    
    console.log('Browser automation completed:', JSON.stringify(result, null, 2));
    
    res.json({
      success: true,
      result: result,
      completedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Browser automation failed:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date().toISOString()
    });
  }
});

// Get browser scout status
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    service: 'browser-scout'
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Browser Scout API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Execute tasks: POST http://localhost:${PORT}/execute`);
});

export default app; 