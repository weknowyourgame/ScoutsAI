import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scoutId, userQuery } = body;

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
        provider: 'groq',
        model_id: 'llama-3.1-8b-instant'
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
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      try {
        const storedTasks = [];
        for (const task of data.tasks) {
          const storedTask = await prisma.todo.create({
            data: {
              scoutId: scoutId,
              userId: 'temp-user-id', // TODO: Get from auth
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
        data.error = 'Failed to store tasks in database';
      } finally {
        await prisma.$disconnect();
      }
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Task generation error:', error);
    
    return NextResponse.json(
      { error: 'Task generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 