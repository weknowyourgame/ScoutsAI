import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'process' } = body;

    switch (action) {
      case 'process':
        return await processScouts();
      case 'summarize':
        return await generateSummaries();
      case 'cleanup':
        return await cleanupFailedTodos();
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: process, summarize, or cleanup' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Scheduler error:', error);
    
    return NextResponse.json(
      { 
        error: 'Scheduler failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Process scouts and their todos
async function processScouts() {
  try {
    // Get all in-progress scouts
    const inProgressScouts = await prisma.scout.findMany({
      where: {
        status: 'IN_PROGRESS'
      },
      include: {
        todos: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    const processedScouts = [];
    const queuedTodos = [];

    for (const scout of inProgressScouts) {
      try {
        // Queue todos for processing
        const queueResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/queue-todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scoutId: scout.id
          })
        });

        if (queueResponse.ok) {
          const queueData = await queueResponse.json();
          processedScouts.push({
            scoutId: scout.id,
            userQuery: scout.userQuery,
            todosQueued: queueData.todosQueued
          });
          queuedTodos.push(...queueData.queuedTodos || []);
        }
      } catch (error) {
        console.error(`Failed to process scout ${scout.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedScouts.length} scouts`,
      processedScouts,
      queuedTodos
    });

  } catch (error) {
    console.error('Process scouts error:', error);
    throw error;
  }
}

// Generate summaries for completed scouts
async function generateSummaries() {
  try {
    // Find scouts that have completed todos but no final summary
    const scoutsToSummarize = await prisma.scout.findMany({
      where: {
        status: 'IN_PROGRESS',
        todos: {
          some: {
            status: 'COMPLETED'
          }
        },
        summaries: {
          none: {
            todoId: null // No final summary exists
          }
        }
      },
      include: {
        todos: {
          where: {
            status: 'COMPLETED'
          }
        },
        summaries: true
      }
    });

    const generatedSummaries = [];

    for (const scout of scoutsToSummarize) {
      try {
        // Check if scout is ready for final summary
        const totalTodos = await prisma.todo.count({
          where: { scoutId: scout.id }
        });

        const completedTodos = await prisma.todo.count({
          where: { 
            scoutId: scout.id,
            status: 'COMPLETED'
          }
        });

        // Generate summary if most todos are completed
        if (completedTodos >= Math.max(2, totalTodos * 0.7)) {
          const summaryResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-summary`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              scoutId: scout.id
            })
          });

          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            generatedSummaries.push({
              scoutId: scout.id,
              userQuery: scout.userQuery,
              summary: summaryData.summary
            });
          }
        }
      } catch (error) {
        console.error(`Failed to generate summary for scout ${scout.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedSummaries.length} summaries`,
      generatedSummaries
    });

  } catch (error) {
    console.error('Generate summaries error:', error);
    throw error;
  }
}

// Cleanup failed todos and retry if possible
async function cleanupFailedTodos() {
  try {
    // Find failed todos that can be retried
    const failedTodos = await prisma.todo.findMany({
      where: {
        status: 'FAILED',
        retryCount: {
          lt: 3 // Max 3 retries
        }
      }
    });

    const retriedTodos = [];

    for (const todo of failedTodos) {
      try {
        // Reset todo status to PENDING for retry
        await prisma.todo.update({
          where: { id: todo.id },
          data: {
            status: 'PENDING',
            errorMessage: null
          }
        });

        retriedTodos.push({
          todoId: todo.id,
          title: todo.title,
          retryCount: todo.retryCount + 1
        });
      } catch (error) {
        console.error(`Failed to retry todo ${todo.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Retried ${retriedTodos.length} failed todos`,
      retriedTodos
    });

  } catch (error) {
    console.error('Cleanup failed todos error:', error);
    throw error;
  }
} 