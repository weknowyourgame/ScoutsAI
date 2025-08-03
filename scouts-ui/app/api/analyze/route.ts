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
    console.error('Analyze API error:', error)
    
    // If it's a connection error, return a better fallback response
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json({
        choices: [{
          message: {
            content: "I'll help you research and gather information on your topic. Let me create a comprehensive search and analysis plan to find the most relevant and up-to-date information for you."
          }
        }]
      })
    }
    
    return NextResponse.json(
      { error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 