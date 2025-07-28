import { cn } from '@/lib/utils'
import React from 'react'

const NeumorphButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("relative [box-shadow:0_0_10px_-1px_#00000040] border border-black/50 after:absolute after:content-[''] after:inset-0 after:border-[#2A2A2A] bg-[#212121] flex items-center justify-center w-max [&>div]:hover:translate-y-1 after:border-t-[3px]  after:border-b-[3px] after:border-b-black/50 after:hover:border-b-0 after:border-r-0 after:hover:border-t-black/50 after:hover:[box-shadow:0_5px_15px_0_#00000070_inset] rounded-2xl after:rounded-2xl overflow-hidden", className)}>
            <div className="flex items-center justify-center p-0">
                {children}
            </div>
        </div>
    )
}

export default NeumorphButton