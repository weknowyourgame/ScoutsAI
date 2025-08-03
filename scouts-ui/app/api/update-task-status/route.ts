import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { todoId, status, resultData } = body;

    if (!todoId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: todoId, status' },
        { status: 400 }
      );
    }

    // Update the todo status
    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        status: status,
        resultData: resultData || {},
        lastRunAt: new Date(),
        ...(status === 'COMPLETED' && { completedAt: new Date() })
      }
    });

    console.log(`Task ${todoId} status updated to ${status}`);

    return NextResponse.json({
      success: true,
      todoId: todoId,
      status: status,
      updatedAt: updatedTodo.updatedAt
    });

  } catch (error) {
    console.error('Task status update error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update task status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 