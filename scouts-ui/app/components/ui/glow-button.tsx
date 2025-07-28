import { cn } from '@/lib/utils'
import { ChevronRight, Notebook } from 'lucide-react'
import { PaperPlaneIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import React from 'react'

export enum VaraintColor {
    orange = 'orange',
    blue = 'blue',
    green = 'green',
    indigo = 'indigo-900'
}

const GlowButtonComponent = ({
    children,
    variant = VaraintColor.orange,
    disableChevron = false,
    className
}: {
    children: React.ReactNode,
    variant?: string,
    disableChevron?: boolean,
    className?: string
}) => {
    return (
        <button className={cn("hover:opacity-[0.90] rounded-[1.1rem] border font-extralight  relative overflow-hidden after:absolute after:content-[''] after:inset-0 after:[box-shadow:0_0_15px_-1px_#ffffff90_inset] after:rounded-[1rem] before:absolute before:content-[''] before:inset-0  before:rounded-[1rem] flex items-center before:z-20 after:z-10",
            variant === VaraintColor.indigo ? "bg-indigo-900" : variant === VaraintColor.blue ? "bg-blue-900" : variant === VaraintColor.green ? "bg-green-900" : variant === VaraintColor.orange ? "bg-orange-900" : "bg-orange-900", className)}>
            <div className="flex items-center gap-2 border-r border-[#fff]/40 px-4 py-3 z-0 ">
                <EyeOpenIcon className='w-5' />
                <p>{children}</p>
            </div>
            <div className={cn("px-3", disableChevron ? 'hidden' : '')}>
            <PaperPlaneIcon className='w-5' />
            </div>
        </button>
    )
}

export default GlowButtonComponent