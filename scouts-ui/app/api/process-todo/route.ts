import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy todo processor disabled',
      message: 'Todos are processed by the ai-worker Cloudflare Queue consumer.',
    },
    { status: 410 }
  );
}
