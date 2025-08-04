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

    // Get scout with all related data
    const scout = await prisma.scout.findUnique({
      where: { id: scoutId },
      include: {
        todos: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            logs: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 5 // Get last 5 logs per todo
            }
          }
        },
        summaries: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        logs: {
          where: {
            todoId: null // Scout-level logs only
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!scout) {
      return NextResponse.json(
        { error: 'Scout not found' },
        { status: 404 }
      );
    }

    // Calculate progress metrics
    const totalTodos = scout.todos.length;
    const completedTodos = scout.todos.filter(t => t.status === 'COMPLETED').length;
    const failedTodos = scout.todos.filter(t => t.status === 'FAILED').length;
    const inProgressTodos = scout.todos.filter(t => t.status === 'IN_PROGRESS').length;
    const pendingTodos = scout.todos.filter(t => t.status === 'PENDING').length;

    const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(scoutId);

    // Format todos with progress information
    const formattedTodos = scout.todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      agentType: todo.agentType,
      taskType: todo.taskType,
      status: todo.status,
      progress: getTodoProgress(todo),
      resultData: todo.resultData,
      errorMessage: todo.errorMessage,
      retryCount: todo.retryCount,
      maxRetries: todo.maxRetries,
      createdAt: todo.createdAt,
      lastRunAt: todo.lastRunAt,
      completedAt: todo.completedAt,
      logs: todo.logs.map(log => ({
        id: log.id,
        message: log.message,
        data: log.data,
        createdAt: log.createdAt
      }))
    }));

    // Format summaries
    const formattedSummaries = scout.summaries.map(summary => ({
      id: summary.id,
      title: summary.title,
      content: summary.content,
      data: summary.data,
      createdAt: summary.createdAt,
      isFinalSummary: summary.todoId === null
    }));

    // Format scout-level logs
    const formattedLogs = scout.logs.map(log => ({
      id: log.id,
      message: log.message,
      data: log.data,
      createdAt: log.createdAt
    }));

    const response = {
      scout: {
        id: scout.id,
        userQuery: scout.userQuery,
        status: scout.status,
        notificationFrequency: scout.notificationFrequency,
        createdAt: scout.createdAt,
        updatedAt: scout.updatedAt
      },
      progress: {
        totalTodos,
        completedTodos,
        failedTodos,
        inProgressTodos,
        pendingTodos,
        progressPercentage,
        status: scout.status
      },
      performance: performanceMetrics,
      todos: formattedTodos,
      summaries: formattedSummaries,
      logs: formattedLogs
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Scout status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get scout status', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get performance metrics for the scout
async function getPerformanceMetrics(scoutId: string) {
  try {
    const logs = await prisma.log.findMany({
      where: {
        scoutId: scoutId,
        data: {
          path: ['performance'],
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const performanceData = logs
      .map(log => log.data?.performance)
      .filter(Boolean);

    if (performanceData.length === 0) {
      return {
        averageExecutionTime: 0,
        successRate: 0,
        totalExecutions: 0,
        agentTypeBreakdown: {}
      };
    }

    const totalExecutions = performanceData.length;
    const successfulExecutions = performanceData.filter(p => p.success).length;
    const successRate = (successfulExecutions / totalExecutions) * 100;
    const averageExecutionTime = performanceData.reduce((sum, p) => sum + (p.executionTime || 0), 0) / totalExecutions;

    // Agent type breakdown
    const agentTypeBreakdown = performanceData.reduce((acc, p) => {
      const agentType = p.agentType || 'UNKNOWN';
      if (!acc[agentType]) {
        acc[agentType] = { count: 0, successCount: 0, totalTime: 0 };
      }
      acc[agentType].count++;
      if (p.success) acc[agentType].successCount++;
      acc[agentType].totalTime += p.executionTime || 0;
      return acc;
    }, {} as Record<string, { count: number; successCount: number; totalTime: number }>);

    // Calculate averages for each agent type
    Object.keys(agentTypeBreakdown).forEach(agentType => {
      const data = agentTypeBreakdown[agentType];
      data.successRate = (data.successCount / data.count) * 100;
      data.averageTime = data.totalTime / data.count;
    });

    return {
      averageExecutionTime,
      successRate,
      totalExecutions,
      agentTypeBreakdown
    };

  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return {
      averageExecutionTime: 0,
      successRate: 0,
      totalExecutions: 0,
      agentTypeBreakdown: {}
    };
  }
}

// Get progress information for a todo
function getTodoProgress(todo: any) {
  const logs = todo.logs || [];
  
  if (todo.status === 'COMPLETED') {
    return {
      status: 'completed',
      percentage: 100,
      lastActivity: todo.completedAt,
      executionTime: logs.find(l => l.data?.performance?.executionTime)?.data?.performance?.executionTime || 0
    };
  } else if (todo.status === 'FAILED') {
    return {
      status: 'failed',
      percentage: 0,
      lastActivity: todo.lastRunAt,
      error: todo.errorMessage,
      retryCount: todo.retryCount
    };
  } else if (todo.status === 'IN_PROGRESS') {
    return {
      status: 'in_progress',
      percentage: 50, // Estimate
      lastActivity: todo.lastRunAt,
      startTime: logs.find(l => l.message.includes('Started'))?.createdAt
    };
  } else {
    return {
      status: 'pending',
      percentage: 0,
      lastActivity: null
    };
  }
} 