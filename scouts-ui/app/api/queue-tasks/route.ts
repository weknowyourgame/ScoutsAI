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

    // Get all pending todos for this scout
    const todos = await prisma.todo.findMany({
      where: {
        scoutId: scoutId,
        status: 'PENDING'
      },
      include: {
        scout: {
          select: {
            notificationFrequency: true
          }
        }
      }
    });

    if (todos.length === 0) {
      return NextResponse.json(
        { message: 'No pending tasks found for this scout' },
        { status: 200 }
      );
    }

    console.log(`Queueing ${todos.length} tasks for scout:`, scoutId);

    // Queue each task to bullmq
    const bullmqUrl = process.env.BULLMQ_URL || 'http://localhost:3001';
    const queuedTasks = [];

    for (const todo of todos) {
      try {
        const taskData = {
          todoId: todo.id,
          title: todo.title,
          description: todo.description,
          agentType: todo.agentType,
          taskType: todo.taskType,
          condition: todo.condition || null,
          resultData: todo.resultData || {},
          userId: todo.userId,
          scoutId: todo.scoutId,
          goTo: todo.goTo || [],
          search: todo.search || [],
          actions: todo.actions || [],
          notificationFrequency: todo.scout.notificationFrequency
        };
        
        console.log('Sending task to BullMQ:', JSON.stringify(taskData, null, 2));
        
        const response = await fetch(`${bullmqUrl}/add-task`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData)
        });

        if (response.ok) {
          const result = await response.json();
          queuedTasks.push({
            todoId: todo.id,
            jobId: result.jobId,
            status: 'queued'
          });

          // Update todo status to IN_PROGRESS
          await prisma.todo.update({
            where: { id: todo.id },
            data: { status: 'IN_PROGRESS' }
          });
        } else {
          console.error(`Failed to queue task ${todo.id}:`, response.status);
          queuedTasks.push({
            todoId: todo.id,
            status: 'failed',
            error: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        console.error(`Error queueing task ${todo.id}:`, error);
        queuedTasks.push({
          todoId: todo.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('Tasks queued successfully:', queuedTasks);
    
    return NextResponse.json({
      success: true,
      queuedTasks,
      totalTasks: todos.length,
      successfulTasks: queuedTasks.filter(t => t.status === 'queued').length
    });
    
  } catch (error) {
    console.error('Task queueing error:', error);
    
    return NextResponse.json(
      { error: 'Task queueing failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 