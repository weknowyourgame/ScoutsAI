import Image from "next/image";
import FloatingMenu from "./components/FloatingMenu";
import GlowButton from "./components/Glow-button";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 relative">
      {/* Floating menu positioned more towards middle and smaller */}
      <div className="fixed top-1/6 left-1/10 transform -translate-x-1/2 -translate-y-1/2 z-50 scale-100">
        <FloatingMenu />
      </div>
      
      {/* Main content */}
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <GlowButton />
        </main>
      </div>
    </div>
  );
}
