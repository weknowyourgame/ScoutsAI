import { NextRequest, NextResponse } from 'next/server';
import { addLocalTodos } from '@/app/lib/local-store';
import { isServerLocalOnlyMode } from '@/app/lib/local-mode';

function appUrl() {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  let fallbackScoutId: string | undefined;
  let fallbackUserQuery: string | undefined;
  let fallbackUserId = 'test-user-local';

  try {
    const body = await request.json();
    const { scoutId, userQuery, userId = 'test-user-local' } = body;
    fallbackScoutId = scoutId;
    fallbackUserQuery = userQuery;
    fallbackUserId = userId;

    if (!scoutId || !userQuery) {
      return NextResponse.json(
        { error: 'Missing required fields: scoutId, userQuery' },
        { status: 400 }
      );
    }

    // Forward the request to the AI worker for task generation
    const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787';
    
    console.log('Generating tasks for scout:', scoutId);
    
    const response = await fetch(`${aiWorkerUrl}/generate-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scoutId,
        userQuery,
        userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Worker error:', response.status, errorText);
      throw new Error(`AI Worker responded with status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Tasks generated successfully:', data);
    
    // If tasks were generated successfully, store them in the database
    if (data.success && data.tasks && data.tasks.length > 0) {
      if (isServerLocalOnlyMode()) {
        const storedTasks = addLocalTodos(scoutId, userId, data.tasks);
        data.tasksStored = storedTasks.length;
        data.storedTasks = storedTasks;
        data.localOnly = true;
        return NextResponse.json(data);
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      let storedTasks = [];
      
      try {
        for (const task of data.tasks) {
          const storedTask = await prisma.todo.create({
            data: {
              scoutId: scoutId,
              userId,
              title: task.title,
              description: task.description,
              agentType: task.agentType,
              taskType: task.taskType,
              condition: task.condition || null,
              goTo: task.goTo || [],
              search: task.search || [],
              actions: task.actions || null,
              status: 'PENDING'
            }
          });
          storedTasks.push(storedTask);
        }
        
        data.tasksStored = storedTasks.length;
        data.storedTasks = storedTasks;
      } catch (error) {
        console.error('Failed to store tasks in database:', error);
        storedTasks = addLocalTodos(scoutId, userId, data.tasks);
        data.tasksStored = storedTasks.length;
        data.storedTasks = storedTasks;
        data.localOnly = true;
        data.warning = 'Database unavailable; stored tasks in local dev memory';
      } finally {
        await prisma.$disconnect();
      }

      if (storedTasks.length > 0) {
        try {
          const queueResponse = await fetch(`${appUrl()}/api/queue-todos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              scoutId: scoutId
            })
          });

          if (queueResponse.ok) {
            const queueData = await queueResponse.json();
            data.todosQueued = queueData.todosQueued;
            data.queuedTodos = queueData.queuedTodos;
          }
        } catch (error) {
          console.error('Failed to queue todos:', error);
          data.queueError = 'Failed to queue todos for processing';
        }
      }
    }

    return NextResponse.json(data);

  } catch (error) {
    console.warn('Task generation fallback:', error instanceof Error ? error.message : error);

    if (fallbackScoutId && fallbackUserQuery) {
      const tasks = fallbackTasksForQuery(fallbackUserQuery);
      const storedTasks = addLocalTodos(fallbackScoutId, fallbackUserId, tasks);

      try {
        await fetch(`${appUrl()}/api/queue-todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ scoutId: fallbackScoutId })
        });
      } catch (queueError) {
        console.warn('Failed to queue fallback todos:', queueError instanceof Error ? queueError.message : queueError);
      }

      return NextResponse.json({
        success: true,
        scoutId: fallbackScoutId,
        tasksGenerated: tasks.length,
        tasks,
        tasksStored: storedTasks.length,
        storedTasks,
        localOnly: true,
        warning: error instanceof Error ? error.message : 'AI worker unavailable'
      });
    }

    return NextResponse.json(
      { error: 'Task generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function fallbackTasksForQuery(userQuery: string) {
  return [
    {
      title: `Research updates for: ${userQuery}`,
      description: 'Local fallback task created because AI task generation is unavailable.',
      agentType: 'RESEARCH_AGENT',
      taskType: 'SINGLE_RUN',
      condition: null,
      goTo: [],
      search: [userQuery],
      actions: null
    }
  ];
}
