'use client';

import AiInput from "./components/AiInput";
import SidebarScouts from "./components/SidebarScouts";
import ScoutChat from "./components/ScoutChat";
import { useState } from "react";
import { getOrCreateLocalScoutUser } from "./lib/local-user";
import { addBrowserTodos, createBrowserScout } from "./lib/browser-scout-store";
import { isBrowserLocalOnlyMode } from "./lib/local-mode";

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
                    const localUser = getOrCreateLocalScoutUser(email)
                    
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
                    
                    const scoutPayload = {
                        userQuery: query,
                        userId: localUser.id,
                        email: localUser.email,
                        notificationFrequency: mapNotificationFrequency(notificationFrequency)
                      };

                    const scout = isBrowserLocalOnlyMode()
                      ? createBrowserScout(scoutPayload)
                      : await createServerScout(scoutPayload);

                    console.log('Scout created:', scout)
                    setSelectedScout(scout.id)
                    
                    // Generate tasks for the scout
                    const taskResponse = await fetch('/api/generate-tasks', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        scoutId: scout.id,
                        userQuery: query,
                        userId: localUser.id
                      })
                    })
                    
                    if (!taskResponse.ok) {
                      throw new Error('Failed to generate tasks')
                    }
                    
                    const taskData = await taskResponse.json()
                    if (isBrowserLocalOnlyMode() && taskData.tasks?.length) {
                      addBrowserTodos(scout.id, localUser.id, taskData.tasks)
                    }
                    console.log('Tasks generated:', taskData)
                    
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

async function createServerScout(payload: {
  userQuery: string;
  userId: string;
  email?: string;
  notificationFrequency: string;
}) {
  const scoutResponse = await fetch('/api/scouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!scoutResponse.ok) {
    throw new Error('Failed to create scout');
  }

  const scoutData = await scoutResponse.json();
  return scoutData.scout;
}
