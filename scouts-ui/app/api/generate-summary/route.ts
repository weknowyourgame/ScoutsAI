import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scoutId } = body;

    if (!scoutId) {
      return NextResponse.json(
        { error: 'Missing required field: scoutId' },
        { status: 400 }
      );
    }

    // Get the scout and its completed todos
    const scout = await prisma.scout.findUnique({
      where: { id: scoutId },
      include: {
        todos: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            completedAt: 'asc'
          }
        },
        summaries: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!scout) {
      return NextResponse.json(
        { error: 'Scout not found' },
        { status: 404 }
      );
    }

    if (scout.todos.length === 0) {
      return NextResponse.json(
        { error: 'No completed todos found for this scout' },
        { status: 400 }
      );
    }

    // Generate comprehensive summary using AI
    const summaryContent = await generateComprehensiveSummary(scout);

    // Create the final summary record
    const finalSummary = await prisma.summary.create({
      data: {
        userId: scout.userId,
        scoutId: scoutId,
        todoId: null, // This is the final summary, not tied to a specific todo
        title: `Final Summary: ${scout.userQuery}`,
        content: summaryContent,
        data: {
          summaryType: 'final_summary',
          todosAnalyzed: scout.todos.length,
          individualSummaries: scout.summaries.length,
          scoutQuery: scout.userQuery
        }
      }
    });

    // Update scout status to completed
    await prisma.scout.update({
      where: { id: scoutId },
      data: {
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({
      success: true,
      summary: finalSummary,
      message: 'Comprehensive summary generated successfully'
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Summary generation failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function generateComprehensiveSummary(scout: any): Promise<string> {
  // Prepare data for AI analysis
  const todoData = scout.todos.map((todo: any) => ({
    title: todo.title,
    agentType: todo.agentType,
    taskType: todo.taskType,
    resultData: todo.resultData,
    completedAt: todo.completedAt
  }));

  const individualSummaries = scout.summaries.map((summary: any) => ({
    title: summary.title,
    content: summary.content
  }));

  // Call Perplexity API for comprehensive summary generation
  const summaryResponse = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a comprehensive analysis assistant. Create detailed, well-structured summaries that include:

1. **Executive Summary**: Key findings and insights
2. **Data Analysis**: Patterns, trends, and important data points
3. **Recommendations**: Actionable insights and next steps
4. **Risk Assessment**: Potential issues or concerns
5. **Timeline**: Important dates and milestones
6. **Sources**: Key sources and references

Format the response with clear sections and bullet points for easy reading.`
        },
        {
          role: 'user',
          content: `Generate a comprehensive summary for the following scout:

**Original Query**: ${scout.userQuery}

**Completed Tasks**:
${todoData.map((todo: any) => `
- ${todo.title} (${todo.agentType})
  - Type: ${todo.taskType}
  - Completed: ${todo.completedAt}
  - Results: ${JSON.stringify(todo.resultData, null, 2)}
`).join('\n')}

**Individual Summaries**:
${individualSummaries.map((summary: any) => `
- ${summary.title}: ${summary.content}
`).join('\n')}

Please provide a comprehensive analysis that synthesizes all this information into actionable insights.`
        }
      ],
      max_tokens: 3000
    })
  });

  if (!summaryResponse.ok) {
    throw new Error(`Summary API error: ${summaryResponse.status}`);
  }

  const summaryData = await summaryResponse.json();
  return summaryData.choices?.[0]?.message?.content || 'Failed to generate summary';
} 