import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy BullMQ route disabled',
      message: 'Use /api/queue-todos, which enqueues through the Cloudflare Worker queue producer.',
    },
    { status: 410 }
  );
}
