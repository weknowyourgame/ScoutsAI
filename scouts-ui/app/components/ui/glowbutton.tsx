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

const GlowButtonGeneric = ({
    children,
    variant = VaraintColor.orange,
    disableChevron = false,
    className,
    leftIcon,
    rightIcon,
    onClick
}: {
    children: React.ReactNode,
    variant?: string,
    disableChevron?: boolean,
    className?: string,
    leftIcon?: React.ReactNode,
    rightIcon?: React.ReactNode,
    onClick?: () => void
}) => {
    return (
        <button 
            onClick={onClick}
            className={cn("hover:opacity-[0.90] rounded-xl border font-extralight relative overflow-hidden after:absolute after:content-[''] after:inset-0 after:[box-shadow:0_0_15px_-1px_#ffffff90_inset] after:rounded-xl before:absolute before:content-[''] before:inset-0  before:rounded-xl flex items-center before:z-20 after:z-10 text-sm",
                "bg-neutral-800 text-neutral-500 hover:text-white", className)}>
            <div className="flex items-center gap-2 border-r border-neutral-600 px-3 py-2 z-0 ">
                {leftIcon || <EyeOpenIcon className='w-4 h-4' />}
                <p className="text-sm font-medium">{children}</p>
            </div>
            <div className={cn("px-3", disableChevron ? 'hidden' : '')}>
                {rightIcon || <PaperPlaneIcon className='w-4 h-4' />}
            </div>
        </button>
    )
}

export default GlowButtonGeneric