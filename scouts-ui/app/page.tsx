'use client';

import AiInput from "./components/AiInput";
import FloatingMenu from "./components/FloatingMenu";

export default function Home() {

  return (
    <div className="font-sans min-h-screen p-8 pb-20 relative">
      {/* Floating menu positioned more towards middle and smaller */}
      <div className="fixed top-1/6 left-1/10 transform -translate-x-1/2 -translate-y-1/2 z-50 scale-100">
        <FloatingMenu />
      </div>
      
      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <main className="w-full max-w-none">
          <div className="flex flex-col gap-8 items-center w-full">
            <div className="flex flex-col gap-4 items-center w-full">
              <AiInput 
                placeholder="Ask Scout anything..."
                onSubmit={async (value) => {
                  try {
                    console.log('AI Input submitted:', value)
                    
                    // Parse the submission data
                    const submissionData = JSON.parse(value)
                    const { query, notificationFrequency } = submissionData
                    
                    // Map UI notification frequency to database enum
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
                      return mapping[uiValue] || 'ONCE_A_DAY';
                    };
                    
                    // Create scout in database
                    const scoutResponse = await fetch('/api/scouts', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userQuery: query,
                        userId: 'temp-user-id', // TODO: Get from auth
                        notificationFrequency: mapNotificationFrequency(notificationFrequency)
                      })
                    })
                    
                    if (!scoutResponse.ok) {
                      throw new Error('Failed to create scout')
                    }
                    
                    const scoutData = await scoutResponse.json()
                    console.log('Scout created:', scoutData)
                    
                    // Generate tasks for the scout
                    const taskResponse = await fetch('/api/generate-tasks', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        scoutId: scoutData.scout.id,
                        userQuery: query
                      })
                    })
                    
                    if (!taskResponse.ok) {
                      throw new Error('Failed to generate tasks')
                    }
                    
                    const taskData = await taskResponse.json()
                    console.log('Tasks generated:', taskData)
                    
                    // Queue tasks for execution
                    const queueResponse = await fetch('/api/queue-todos', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        scoutId: scoutData.scout.id
                      })
                    })
                    
                    if (!queueResponse.ok) {
                      throw new Error('Failed to queue tasks')
                    }
                    
                    const queueData = await queueResponse.json()
                    console.log('Tasks queued:', queueData)
                    
                  } catch (error) {
                    console.error('Error in scout creation flow:', error)
                  }
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
