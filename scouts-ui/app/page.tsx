'use client';

import AiInput from "./components/AiInput";
import SidebarScouts from "./components/SidebarScouts";
import ScoutChat from "./components/ScoutChat";
import { useState } from "react";

export default function Home() {

  const [selectedScout, setSelectedScout] = useState<string | undefined>(undefined)

  return (
    <div className="font-sans min-h-screen flex">
      <SidebarScouts onSelect={setSelectedScout} selectedId={selectedScout} />
      <div className="flex-1 p-6">
        <main className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col gap-6 items-center w-full">
            <div className="w-full">
              <AiInput 
                placeholder="Ask Scout anything... (e.g., Pelosi stock alerts)"
                onSubmit={async (value) => {
                  try {
                    console.log('AI Input submitted:', value)
                    
                    // Parse the submission data
                    const submissionData = JSON.parse(value)
                    const { query, notificationFrequency, email } = submissionData
                    
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
                        email,
                        notificationFrequency: mapNotificationFrequency(notificationFrequency)
                      })
                    })
                    
                    if (!scoutResponse.ok) {
                      throw new Error('Failed to create scout')
                    }
                    
                    const scoutData = await scoutResponse.json()
                    console.log('Scout created:', scoutData)
                    setSelectedScout(scoutData.scout.id)
                    
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
            <div className="w-full mt-6">
              <ScoutChat scoutId={selectedScout} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
