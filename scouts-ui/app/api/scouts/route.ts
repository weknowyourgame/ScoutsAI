import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const allScouts = await prisma.scout.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        },
        todos: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ scouts: allScouts });
  } catch (error) {
    console.error('Error fetching scouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userQuery, userId, notificationFrequency = 'ONCE_A_DAY' } = body;

    const newScout = await prisma.scout.create({
      data: {
        userId,
        userQuery,
        notificationFrequency: notificationFrequency as any,
        status: 'IN_PROGRESS'
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    return NextResponse.json({ scout: newScout });
  } catch (error) {
    console.error('Error creating scout:', error);
    return NextResponse.json(
      { error: 'Failed to create scout' },
      { status: 500 }
    );
  }
} 