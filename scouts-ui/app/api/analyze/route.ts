import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to the AI worker
    // In development, this will be localhost:8787
    // In production, this should be your deployed AI worker URL
    const aiWorkerUrl = process.env.AI_WORKER_URL || 'http://localhost:8787'
    
    console.log('Forwarding analyze request to:', aiWorkerUrl)
    
    const response = await fetch(`${aiWorkerUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI Worker error:', response.status, errorText)
      throw new Error(`AI Worker responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Analysis response received:', JSON.stringify(data, null, 2))
    return NextResponse.json(data)
    
  } catch (error) {
    console.warn('Analyze fallback:', error instanceof Error ? error.message : error)

    return NextResponse.json({
      choices: [{
        message: {
          content: "I'll help monitor this request and look for the most relevant updates."
        }
      }],
      localOnly: true,
      warning: error instanceof Error ? error.message : 'AI worker unavailable'
    })
  }
}
