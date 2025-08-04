import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scoutId } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: 'Missing required field: scoutId' },
        { status: 400 }
      );
    }

    // Get all pending todos for the scout
    const todos = await prisma.todo.findMany({
      where: {
        scoutId: scoutId,
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (todos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending todos found for this scout',
        todosQueued: 0
      });
    }

    const queuedTodos = [];

    for (const todo of todos) {
      // Check if todo should be processed based on task type and scheduling
      const shouldProcess = await shouldProcessTodo(todo);
      
      if (shouldProcess) {
        try {
          // Queue the todo for processing
          const processResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/process-todo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              todoId: todo.id
            })
          });

          if (processResponse.ok) {
            queuedTodos.push({
              id: todo.id,
              title: todo.title,
              agentType: todo.agentType,
              status: 'queued'
            });
          } else {
            console.error(`Failed to queue todo ${todo.id}:`, await processResponse.text());
          }
        } catch (error) {
          console.error(`Error queuing todo ${todo.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Queued ${queuedTodos.length} todos for processing`,
      todosQueued: queuedTodos.length,
      queuedTodos: queuedTodos
    });

  } catch (error) {
    console.error('Todo queuing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Todo queuing failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Determine if a todo should be processed based on its task type and scheduling
async function shouldProcessTodo(todo: any): Promise<boolean> {
  const now = new Date();

  switch (todo.taskType) {
    case 'SINGLE_RUN':
      // Single run todos should be processed immediately if they haven't been run before
      return !todo.lastRunAt;

    case 'CONTINUOUSLY_RUNNING':
      // Check if it's time to run based on scheduling
      if (!todo.scheduledFor) {
        // If no schedule set, run immediately
        return true;
      }
      
      const scheduledTime = new Date(todo.scheduledFor);
      return now >= scheduledTime;

    case 'RUN_ON_CONDITION':
      // Check if conditions are met
      return await checkCondition(todo);

    case 'THINKING_RESEARCH':
      // Research tasks should run after other todos are completed
      const completedTodos = await prisma.todo.count({
        where: {
          scoutId: todo.scoutId,
          status: 'COMPLETED'
        }
      });
      
      // Run if there are at least 2 completed todos (including Deep Research)
      return completedTodos >= 2;

    case 'FAILED_TASK_RECOVERY':
      // Only run if there are failed todos
      const failedTodos = await prisma.todo.count({
        where: {
          scoutId: todo.scoutId,
          status: 'FAILED'
        }
      });
      
      return failedTodos > 0;

    default:
      return false;
  }
}

// Check if conditions are met for RUN_ON_CONDITION todos
async function checkCondition(todo: any): Promise<boolean> {
  if (!todo.condition) {
    return false;
  }

  const condition = todo.condition;

  switch (condition.type) {
    case 'price_threshold':
      // Check if price is below/above threshold
      const priceData = await getLatestPriceData(todo.scoutId);
      if (priceData && condition.parameters) {
        const price = parseFloat(priceData.price);
        const threshold = parseFloat(condition.parameters.threshold);
        
        if (condition.parameters.comparison === 'less_than') {
          return price < threshold;
        } else if (condition.parameters.comparison === 'greater_than') {
          return price > threshold;
        }
      }
      return false;

    case 'data_change':
      // Check if data has changed significantly
      const recentTodos = await prisma.todo.findMany({
        where: {
          scoutId: todo.scoutId,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });
      
      return recentTodos.length > 0;

    case 'time_based':
      // Check if it's time to run
      if (condition.parameters && condition.parameters.scheduledTime) {
        const scheduledTime = new Date(condition.parameters.scheduledTime);
        return new Date() >= scheduledTime;
      }
      return false;

    case 'failure_count':
      // Check if there are failed todos
      const failedCount = await prisma.todo.count({
        where: {
          scoutId: todo.scoutId,
          status: 'FAILED'
        }
      });
      
      const maxFailures = condition.parameters?.maxFailures || 3;
      return failedCount >= maxFailures;

    default:
      return false;
  }
}

// Get the latest price data for price threshold conditions
async function getLatestPriceData(scoutId: string): Promise<any> {
  const latestTodo = await prisma.todo.findFirst({
    where: {
      scoutId: scoutId,
      status: 'COMPLETED',
      resultData: {
        path: ['type'],
        equals: 'BROWSER_AUTOMATION'
      }
    },
    orderBy: {
      completedAt: 'desc'
    }
  });

  if (latestTodo && latestTodo.resultData) {
    // Extract price from result data
    // This is a simplified implementation
    return {
      price: latestTodo.resultData.price || 0
    };
  }

  return null;
} 