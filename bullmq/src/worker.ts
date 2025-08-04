import { Worker } from 'bullmq';
import { jobsQueue } from './queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define result types for better type safety
interface ResearchResult {
  type: 'RESEARCH_AGENT';
  researchQuery: string;
  researchContent: string;
  completedAt: string;
}

interface BrowserAutomationResult {
  type: 'BROWSER_AUTOMATION';
  result: any;
  completedAt: string;
}

interface SearchResult {
  type: 'SEARCH_AGENT';
  result: any;
  completedAt: string;
}

interface ActionScoutResult {
  type: 'ACTION_SCOUT';
  result: any;
  completedAt: string;
}

interface SummaryResult {
  type: 'SUMMARY_AGENT';
  summaryContent: string;
  relatedTodos: number;
  completedAt: string;
}

interface PlexResult {
  type: 'PLEX_AGENT';
  result: any;
  completedAt: string;
}

type TaskResult = ResearchResult | BrowserAutomationResult | SearchResult | ActionScoutResult | SummaryResult | PlexResult;

// Worker to process all types of tasks
const worker = new Worker('stagehand-tasks', async (job) => {
  console.log(`Processing job ${job.id} with data:`, job.data);
  
  const { todoId, agentType, title, description, scoutId, userId } = job.data;
  
  try {
    let result: TaskResult;
    
    // Process based on agent type
    switch (agentType) {
      case 'RESEARCH_AGENT':
        result = await processResearchAgent(job.data);
        break;
      case 'BROWSER_AUTOMATION':
        result = await processBrowserAutomation(job.data);
        break;
      case 'SEARCH_AGENT':
        result = await processSearchAgent(job.data);
        break;
      case 'ACTION_SCOUT':
        result = await processActionScout(job.data);
        break;
      case 'SUMMARY_AGENT':
        result = await processSummaryAgent(job.data);
        break;
      case 'PLEX_AGENT':
        result = await processPlexAgent(job.data);
        break;
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
    
    // Update todo as completed
    await prisma.todo.update({
      where: { id: todoId },
      data: {
        status: 'COMPLETED',
        resultData: result as any, // Cast to any for Prisma JSON field
        completedAt: new Date()
      }
    });
    
    // Create individual todo summary
    await createIndividualTodoSummary(job.data, result);
    
    // Update scout progress
    await updateScoutProgress(scoutId);
    
    console.log(`Job ${job.id} completed successfully`);
    return result;
    
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    
    // Update todo as failed
    await prisma.todo.update({
      where: { id: todoId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        retryCount: {
          increment: 1
        }
      }
    });
    
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  concurrency: 2, // Process 2 jobs at a time
  removeOnComplete: {
    age: 10,
    count: 10
  },
  removeOnFail: {
    age: 5,
    count: 5
  }
});

// RESEARCH_AGENT: Deep Research using ai-worker with Perplexity
async function processResearchAgent(data: any): Promise<ResearchResult> {
  console.log(`Processing RESEARCH_AGENT todo: ${data.title}`);
  
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'perplexity-ai',
      model_id: 'sonar',
      prompt: `Please provide comprehensive research on: ${data.description || data.title}`,
      system_prompt: 'You are a comprehensive research assistant. Provide detailed, well-structured information about the given topic. Include relevant facts, data, trends, and insights.',
      todoData: data
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Worker error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as any;
  const researchContent = result.choices?.[0]?.message?.content || 'Research failed';

  return {
    type: 'RESEARCH_AGENT',
    researchQuery: data.description || data.title,
    researchContent: researchContent,
    completedAt: new Date().toISOString()
  };
}

// BROWSER_AUTOMATION: Use browser-scout for web automation
async function processBrowserAutomation(data: any): Promise<BrowserAutomationResult> {
  console.log(`Processing BROWSER_AUTOMATION todo: ${data.title}`);
  
  // Call browser-scout for web automation
  const browserScoutUrl = process.env.BROWSER_SCOUT_URL || 'http://localhost:3002';
  
  const response = await fetch(`${browserScoutUrl}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      todoId: data.todoId,
      title: data.title,
      description: data.description,
      goTo: data.goTo || [],
      search: data.search || [],
      actions: data.actions || []
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Browser Scout error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    type: 'BROWSER_AUTOMATION',
    result: result,
    completedAt: new Date().toISOString()
  };
}

// SEARCH_AGENT: Use ai-worker endpoint
async function processSearchAgent(data: any): Promise<SearchResult> {
  console.log(`Processing SEARCH_AGENT todo: ${data.title}`);
  
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Search for: ${data.title}. ${data.description || ''}`,
      system_prompt: 'You are a search agent. Find and summarize relevant information.',
      todoData: data
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Worker error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    type: 'SEARCH_AGENT',
    result: result,
    completedAt: new Date().toISOString()
  };
}

// ACTION_SCOUT: Use ai-worker endpoint
async function processActionScout(data: any): Promise<ActionScoutResult> {
  console.log(`Processing ACTION_SCOUT todo: ${data.title}`);
  
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Execute action: ${data.title}. ${data.description || ''}`,
      system_prompt: 'You are an action scout. Execute the requested action or notification.',
      todoData: data
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Worker error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    type: 'ACTION_SCOUT',
    result: result,
    completedAt: new Date().toISOString()
  };
}

// SUMMARY_AGENT: Use ai-worker endpoint
async function processSummaryAgent(data: any): Promise<SummaryResult> {
  console.log(`Processing SUMMARY_AGENT todo: ${data.title}`);
  
  // Get related todos and their results for summary generation
  const relatedTodos = await prisma.todo.findMany({
    where: {
      scoutId: data.scoutId,
      status: 'COMPLETED'
    },
    orderBy: {
      completedAt: 'asc'
    }
  });

  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Generate summary for: ${data.title}. Use the following completed todos as context: ${JSON.stringify(relatedTodos.map(t => ({ title: t.title, resultData: t.resultData })))}`,
      system_prompt: 'You are a summary assistant. Create comprehensive summaries and insights based on the provided data.',
      todoData: data
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Worker error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as any;
  const summaryContent = result.choices?.[0]?.message?.content || 'Summary generation failed';

  // Create summary record
  await prisma.summary.create({
    data: {
      userId: data.userId,
      scoutId: data.scoutId,
      todoId: data.todoId,
      title: data.title,
      content: summaryContent,
      data: {
        relatedTodos: relatedTodos.length,
        summaryType: 'todo_summary'
      }
    }
  });

  return {
    type: 'SUMMARY_AGENT',
    summaryContent: summaryContent,
    relatedTodos: relatedTodos.length,
    completedAt: new Date().toISOString()
  };
}

// PLEX_AGENT: Use ai-worker endpoint
async function processPlexAgent(data: any): Promise<PlexResult> {
  console.log(`Processing PLEX_AGENT todo: ${data.title}`);
  
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Perform advanced research on: ${data.title}. ${data.description || ''}`,
      system_prompt: 'You are an advanced search assistant. Perform comprehensive research and provide detailed analysis.',
      todoData: data
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Worker error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return {
    type: 'PLEX_AGENT',
    result: result,
    completedAt: new Date().toISOString()
  };
}

// Create individual todo summary
async function createIndividualTodoSummary(todo: any, result: TaskResult) {
  try {
    const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
    
    const response = await fetch(`${aiWorkerUrl}/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'groq',
        model_id: 'llama-3.1-8b-instant',
        prompt: `Create a summary for the following completed task:

**Task**: ${todo.title}
**Description**: ${todo.description || 'No description provided'}
**Agent Type**: ${todo.agentType}
**Task Type**: ${todo.taskType}
**Results**: ${JSON.stringify(result, null, 2)}

Please provide a clear, structured summary that highlights:
1. What was accomplished
2. Key findings or data
3. Important insights
4. Any recommendations or next steps

Keep it concise but comprehensive.`,
        system_prompt: 'You are a summary assistant. Create concise, informative summaries of completed tasks. Focus on key findings, insights, and actionable information.'
      })
    });

    if (!response.ok) {
      console.warn('AI Worker not available, using fallback summary');
      return;
    }

    const summaryData = await response.json() as any;
    const summaryContent = summaryData.choices?.[0]?.message?.content || 'Summary generation failed';
    
    // Create summary record
    await prisma.summary.create({
      data: {
        userId: todo.userId,
        scoutId: todo.scoutId,
        todoId: todo.todoId,
        title: `Summary: ${todo.title}`,
        content: summaryContent,
        data: {
          agentType: todo.agentType,
          taskType: todo.taskType,
          resultType: result.type,
          summaryType: 'individual_todo_summary'
        }
      }
    });

    console.log(`Created individual summary for todo: ${todo.title}`);
  } catch (error) {
    console.error(`Failed to create individual summary for todo ${todo.todoId}:`, error);
  }
}

// Update scout progress
async function updateScoutProgress(scoutId: string) {
  try {
    const scout = await prisma.scout.findUnique({
      where: { id: scoutId },
      include: {
        todos: true
      }
    });

    if (!scout) return;

    const totalTodos = scout.todos.length;
    const completedTodos = scout.todos.filter(t => t.status === 'COMPLETED').length;
    const failedTodos = scout.todos.filter(t => t.status === 'FAILED').length;
    const inProgressTodos = scout.todos.filter(t => t.status === 'IN_PROGRESS').length;

    const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    let newStatus = scout.status;
    if (completedTodos === totalTodos && totalTodos > 0) {
      newStatus = 'COMPLETED';
    } else if (failedTodos > 0 && failedTodos >= totalTodos * 0.5) {
      newStatus = 'FAILED';
    } else if (completedTodos > 0 || inProgressTodos > 0) {
      newStatus = 'IN_PROGRESS';
    }

    await prisma.scout.update({
      where: { id: scoutId },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    console.log(`Scout ${scoutId} progress: ${completedTodos}/${totalTodos} completed (${progressPercentage.toFixed(1)}%)`);
  } catch (error) {
    console.error(`Failed to update scout progress for ${scoutId}:`, error);
  }
}

// Handle worker events
worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

worker.on('failed', (job, err) => {
  if (job) {
    console.error(`Job ${job.id} failed with error:`, err);
  } else {
    console.error('Job failed with error (no job object):', err);
  }
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('BullMQ Worker started - processing all task types');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

export default worker; 