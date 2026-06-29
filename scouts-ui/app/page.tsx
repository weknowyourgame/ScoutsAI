'use client';

import { useState } from "react";
import AiInput from "./components/AiInput";
import ScoutChat from "./components/ScoutChat";
import SidebarScouts from "./components/SidebarScouts";
import { addBrowserTodos, createBrowserScout } from "./lib/browser-scout-store";
import { isBrowserLocalOnlyMode } from "./lib/local-mode";
import { getOrCreateLocalScoutUser } from "./lib/local-user";

export default function Home() {
  const [selectedScout, setSelectedScout] = useState<string | undefined>(undefined);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050706] text-white">
      <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_18%_18%,rgba(35,167,125,0.24),transparent_28rem),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.08),transparent_20rem)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[1fr_28rem] lg:px-8">
        <section className="flex min-h-[42rem] flex-col">
          <header className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white text-sm font-black text-[#050706]">S</div>
              <div>
                <div className="text-sm font-semibold">ScoutsAI</div>
                <div className="text-xs text-white/45">always-on web intelligence</div>
              </div>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/65 md:block">
              local browser mode
            </div>
          </header>

          <div className="grid flex-1 items-center gap-6 lg:grid-cols-[15rem_1fr]">
            <SidebarScouts onSelect={setSelectedScout} selectedId={selectedScout} />
            <div className="order-1 lg:order-none">
              <div className="mb-7 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                Track markets, research, launches, people, companies, and signals
              </div>
              <h1 className="max-w-3xl text-[clamp(3rem,6.5vw,6rem)] font-semibold leading-[0.9] tracking-normal">
                Know first.<br />Act faster.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/62">
                Create focused scouts that watch the web, collect useful findings, and keep a live workspace updated.
              </p>
              <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                {["Monitor anything", "Keep artifacts live", "Cut through noise"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm font-medium text-white/78">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="order-2 flex items-center lg:order-none">
          <div className="w-full">
            <div className="mb-5 text-center">
              <div className="text-2xl font-semibold">Start a Scout</div>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/58">
                Describe what to watch. ScoutsAI will turn it into tasks and keep it in your browser locally.
              </p>
            </div>
            <AiInput
              placeholder="Track new AI coding tools and funding news..."
              onSubmit={async (value) => {
                try {
                  const submissionData = JSON.parse(value);
                  const { query, notificationFrequency, email } = submissionData;
                  const localUser = getOrCreateLocalScoutUser(email);
                  const scoutPayload = {
                    userQuery: query,
                    userId: localUser.id,
                    email: localUser.email,
                    notificationFrequency: mapNotificationFrequency(notificationFrequency)
                  };

                  const scout = isBrowserLocalOnlyMode()
                    ? createBrowserScout(scoutPayload)
                    : await createServerScout(scoutPayload);

                  setSelectedScout(scout.id);

                  const taskResponse = await fetch('/api/generate-tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      scoutId: scout.id,
                      userQuery: query,
                      userId: localUser.id
                    })
                  });

                  if (!taskResponse.ok) throw new Error('Failed to generate tasks');

                  const taskData = await taskResponse.json();
                  if (isBrowserLocalOnlyMode() && taskData.tasks?.length) {
                    addBrowserTodos(scout.id, localUser.id, taskData.tasks);
                  }
                } catch (error) {
                  console.error('Error in scout creation flow:', error);
                }
              }}
            />
            <div className="mt-6">
              <ScoutChat scoutId={selectedScout} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function mapNotificationFrequency(uiValue: string) {
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
}

async function createServerScout(payload: {
  userQuery: string;
  userId: string;
  email?: string;
  notificationFrequency: string;
}) {
  const scoutResponse = await fetch('/api/scouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!scoutResponse.ok) throw new Error('Failed to create scout');

  const scoutData = await scoutResponse.json();
  return scoutData.scout;
}
