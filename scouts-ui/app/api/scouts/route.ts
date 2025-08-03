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