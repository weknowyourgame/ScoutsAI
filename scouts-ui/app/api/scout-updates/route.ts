import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scoutId = searchParams.get('scoutId');

    if (!scoutId) {
      return NextResponse.json(
        { error: 'Missing scoutId parameter' },
        { status: 400 }
      );
    }

    // Set up Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial data
        const sendUpdate = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Send initial scout status
        sendInitialStatus(scoutId, sendUpdate);

        // Set up polling for updates
        const interval = setInterval(async () => {
          try {
            const updates = await getScoutUpdates(scoutId);
            if (updates.hasChanges) {
              sendUpdate(updates);
            }
          } catch (error) {
            console.error('Error getting scout updates:', error);
          }
        }, 2000); // Poll every 2 seconds

        // Clean up on close
        return () => {
          clearInterval(interval);
        };
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('Scout updates error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get scout updates', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function sendInitialStatus(scoutId: string, sendUpdate: (data: any) => void) {
  try {
    const scout = await prisma.scout.findUnique({
      where: { id: scoutId },
      include: {
        todos: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (scout) {
      const totalTodos = scout.todos.length;
      const completedTodos = scout.todos.filter(t => t.status === 'COMPLETED').length;
      const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

      sendUpdate({
        type: 'initial_status',
        scout: {
          id: scout.id,
          userQuery: scout.userQuery,
          status: scout.status,
          progress: {
            totalTodos,
            completedTodos,
            progressPercentage
          }
        },
        todos: scout.todos.map(todo => ({
          id: todo.id,
          title: todo.title,
          status: todo.status,
          agentType: todo.agentType
        }))
      });
    }
  } catch (error) {
    console.error('Error sending initial status:', error);
  }
}

async function getScoutUpdates(scoutId: string) {
  try {
    // Get recent logs for this scout
    const recentLogs = await prisma.log.findMany({
      where: {
        scoutId: scoutId,
        createdAt: {
          gte: new Date(Date.now() - 10000) // Last 10 seconds
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    if (recentLogs.length === 0) {
      return { hasChanges: false };
    }

    // Get current scout status
    const scout = await prisma.scout.findUnique({
      where: { id: scoutId },
      include: {
        todos: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!scout) {
      return { hasChanges: false };
    }

    const totalTodos = scout.todos.length;
    const completedTodos = scout.todos.filter(t => t.status === 'COMPLETED').length;
    const failedTodos = scout.todos.filter(t => t.status === 'FAILED').length;
    const inProgressTodos = scout.todos.filter(t => t.status === 'IN_PROGRESS').length;
    const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    return {
      hasChanges: true,
      type: 'scout_update',
      timestamp: new Date().toISOString(),
      scout: {
        id: scout.id,
        status: scout.status,
        progress: {
          totalTodos,
          completedTodos,
          failedTodos,
          inProgressTodos,
          progressPercentage
        }
      },
      recentLogs: recentLogs.map(log => ({
        id: log.id,
        message: log.message,
        agentType: log.agentType,
        createdAt: log.createdAt,
        data: log.data
      })),
      todos: scout.todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        status: todo.status,
        agentType: todo.agentType,
        lastRunAt: todo.lastRunAt,
        completedAt: todo.completedAt
      }))
    };

  } catch (error) {
    console.error('Error getting scout updates:', error);
    return { hasChanges: false };
  }
} 