'use client'

import Image from "next/image";
import FloatingMenu from "./components/FloatingMenu";
import GlowButton from "./components/Glow-button";
import AiInput from "./components/AiInput";
import GlowButtonGeneric, { VaraintColor } from "./components/ui/glowbutton";

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
                    console.log('AI Input submitted:', value)
                    // Add your AI processing logic here
                  }}
                />
              </div>
            </div>
        </main>
      </div>
    </div>
  );
}
