import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const allScouts = await prisma.scout.findMany({
      where: {
        // Only show scouts that have todos (properly created)
        todos: {
          some: {}
        }
      },
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

    console.log(`Found ${allScouts.length} scouts with todos`);
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

    // Map UI notification frequency values to database enum values
    const mapNotificationFrequency = (uiValue: string) => {
      const mapping: Record<string, string> = {
        'Every hour': 'EVERY_HOUR',
        'Once a day': 'ONCE_A_DAY', 
        'Once a week': 'ONCE_A_WEEK',
        'Let AI decide :)': 'AI_DECIDE',
        'ONCE_A_DAY': 'ONCE_A_DAY',
        'EVERY_HOUR': 'EVERY_HOUR',
        'ONCE_A_WEEK': 'ONCE_A_WEEK',
        'AI_DECIDE': 'AI_DECIDE'
      };
      
      // Handle the exact value being sent
      if (uiValue === 'Once a week') {
        return 'ONCE_A_WEEK';
      }
      
      return mapping[uiValue] || 'ONCE_A_DAY';
    };

    console.log('Received notificationFrequency:', notificationFrequency);
    const mappedFrequency = mapNotificationFrequency(notificationFrequency);
    console.log('Mapped to:', mappedFrequency);

    const newScout = await prisma.scout.create({
      data: {
        userId,
        userQuery,
        notificationFrequency: mappedFrequency as any,
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