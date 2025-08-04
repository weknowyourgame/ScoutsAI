import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Tasks are now processed through the queue system.',
      message: 'Use the queue-todos endpoint instead.'
    },
    { status: 410 }
  );
}

// RESEARCH_AGENT: Deep Research using ai-worker with Perplexity
async function processResearchAgent(todo: any) {
  console.log(`Processing RESEARCH_AGENT todo: ${todo.title}`);
  
  // Use ai-worker with Perplexity for Deep Research
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const requestBody = {
    provider: 'perplexity-ai',
    model_id: 'sonar',
    prompt: `Please provide comprehensive research on: ${todo.description || todo.title}`,
    system_prompt: 'You are a comprehensive research assistant. Provide detailed, well-structured information about the given topic. Include relevant facts, data, trends, and insights.',
    todoData: todo
  };
  
  console.log('Sending request to AI worker:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI Worker error response:', errorText);
    throw new Error(`AI Worker error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('AI Worker response:', JSON.stringify(result, null, 2));
  const researchContent = result.choices?.[0]?.message?.content;

  return {
    type: 'RESEARCH_AGENT',
    researchQuery: todo.description || todo.title,
    researchContent: researchContent,
    completedAt: new Date().toISOString()
  };
}

// BROWSER_AUTOMATION: Use ai-worker endpoint
async function processBrowserAutomation(todo: any) {
  console.log(`Processing BROWSER_AUTOMATION todo: ${todo.title}`);
  
  // Use ai-worker endpoint
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Execute browser automation for: ${todo.title}. ${todo.description || ''}`,
      system_prompt: 'You are a browser automation agent. Execute the requested web automation task.',
      todoData: todo
    })
  });

  if (!response.ok) {
    throw new Error(`AI Worker error: ${response.status}`);
  }

  const result = await response.json();
  return {
    type: 'BROWSER_AUTOMATION',
    result: result,
    completedAt: new Date().toISOString()
  };
}

// SEARCH_AGENT: Use ai-worker endpoint
async function processSearchAgent(todo: any) {
  console.log(`Processing SEARCH_AGENT todo: ${todo.title}`);
  
  // Use ai-worker endpoint
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Search for: ${todo.title}. ${todo.description || ''}`,
      system_prompt: 'You are a search agent. Find and summarize relevant information.',
      todoData: todo
    })
  });

  if (!response.ok) {
    throw new Error(`AI Worker error: ${response.status}`);
  }

  const result = await response.json();
  return {
    type: 'SEARCH_AGENT',
    result: result,
    completedAt: new Date().toISOString()
  };
}

// ACTION_SCOUT: Use ai-worker endpoint
async function processActionScout(todo: any) {
  console.log(`Processing ACTION_SCOUT todo: ${todo.title}`);
  
  // Use ai-worker endpoint
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Execute action: ${todo.title}. ${todo.description || ''}`,
      system_prompt: 'You are an action scout. Execute the requested action or notification.',
      todoData: todo
    })
  });

  if (!response.ok) {
    throw new Error(`AI Worker error: ${response.status}`);
  }

  const result = await response.json();
  return {
    type: 'ACTION_SCOUT',
    result: result,
    completedAt: new Date().toISOString()
  };
}

// SUMMARY_AGENT: Use ai-worker endpoint
async function processSummaryAgent(todo: any) {
  console.log(`Processing SUMMARY_AGENT todo: ${todo.title}`);
  
  // Get related todos and their results for summary generation
  const relatedTodos = await prisma.todo.findMany({
    where: {
      scoutId: todo.scoutId,
      status: 'COMPLETED'
    },
    orderBy: {
      completedAt: 'asc'
    }
  });

  // Use ai-worker endpoint
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Generate summary for: ${todo.title}. Use the following completed todos as context: ${JSON.stringify(relatedTodos.map(t => ({ title: t.title, resultData: t.resultData })))}`,
      system_prompt: 'You are a summary assistant. Create comprehensive summaries and insights based on the provided data.',
      todoData: todo
    })
  });

  if (!response.ok) {
    throw new Error(`AI Worker error: ${response.status}`);
  }

  const result = await response.json();
  const summaryContent = result.choices?.[0]?.message?.content || 'Summary generation failed';

  // Create summary record
  await prisma.summary.create({
    data: {
      userId: todo.userId,
      scoutId: todo.scoutId,
      todoId: todo.id,
      title: todo.title,
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
async function processPlexAgent(todo: any) {
  console.log(`Processing PLEX_AGENT todo: ${todo.title}`);
  
  // Use ai-worker endpoint
  const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
  
  const response = await fetch(`${aiWorkerUrl}/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      provider: 'groq',
      model_id: 'llama-3.1-8b-instant',
      prompt: `Perform advanced research on: ${todo.title}. ${todo.description || ''}`,
      system_prompt: 'You are an advanced search assistant. Perform comprehensive research and provide detailed analysis.',
      todoData: todo
    })
  });

  if (!response.ok) {
    throw new Error(`AI Worker error: ${response.status}`);
  }

  const result = await response.json();
  return {
    type: 'PLEX_AGENT',
    result: result,
    completedAt: new Date().toISOString()
  };
} 

// Create individual todo summary
async function createIndividualTodoSummary(todo: any, result: any) {
  try {
    // Generate summary content based on agent type and result
    const summaryContent = await generateIndividualSummary(todo, result);
    
    // Create summary record
    await prisma.summary.create({
      data: {
        userId: todo.userId,
        scoutId: todo.scoutId,
        todoId: todo.id,
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
    console.error(`Failed to create individual summary for todo ${todo.id}:`, error);
  }
}

// Generate individual todo summary
async function generateIndividualSummary(todo: any, result: any): Promise<string> {
  // Use ai-worker endpoint for summary generation
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
    return `Summary for ${todo.title}:
    
Task completed successfully using ${todo.agentType}.
Type: ${todo.taskType}
Status: ${todo.status}

Results: ${JSON.stringify(result, null, 2)}

This task was executed and completed successfully.`;
  }

  const summaryData = await response.json();
  return summaryData.choices?.[0]?.message?.content || 'Summary generation failed';
} 

// Update scout progress
async function updateScoutProgress(scoutId: string) {
  try {
    // Get scout and its todos
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

    // Calculate progress percentage
    const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    // Determine scout status
    let newStatus = scout.status;
    if (completedTodos === totalTodos && totalTodos > 0) {
      newStatus = 'COMPLETED';
    } else if (failedTodos > 0 && failedTodos >= totalTodos * 0.5) {
      newStatus = 'FAILED';
    } else if (completedTodos > 0 || inProgressTodos > 0) {
      newStatus = 'IN_PROGRESS';
    }

    // Update scout status and progress
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