"use client";
// Fallback until the component exists or is needed
const AIInputWithLoading = ({ onSubmit, loadingDuration = 1500, placeholder = "Type..." }: { onSubmit: (v: string) => Promise<void> | void; loadingDuration?: number; placeholder?: string; }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex gap-2">
      <input className="flex-1 p-2 rounded border" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        disabled={loading}
        onClick={async () => { setLoading(true); await onSubmit(value); setTimeout(() => setLoading(false), loadingDuration); }}
      >{loading ? '...' : 'Send'}</button>
    </div>
  );
};
import { useState } from "react";

export function Chat() {
  const [messages, setMessages] = useState<string[]>([]);

  const simulateResponse = async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    setMessages(prev => [...prev, message]);
  };

  return (
    <div className="space-y-8 min-w-[350px]">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className="p-4 bg-black/5 dark:bg-white/5 rounded-lg">
              {msg}
            </div>
          ))}
          <AIInputWithLoading 
            onSubmit={simulateResponse}
            loadingDuration={3000}
            placeholder="Type a message..."
          />
        </div>
    </div>
  );
}