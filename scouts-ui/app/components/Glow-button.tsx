'use client'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import GlowButtonComponent from './ui/glow-button'
import { VaraintColor } from './ui/glow-button'

const variants = [
    {
        name: 'orange',
        color: '#DE732C'
    },
    {
        name: 'blue',
        color: '#126fff'
    },
    {
        name: 'green',
        color: '#176635'
    },
    {
        name: 'indigo',
        color: '#126fff'
    }
]

const GlowButton = () => {
    const [selectedVariant, setSelectedVariant] = useState(variants[0])
    return (
        <div className='w-full flex items-center justify-center relative'>
            {/* <div className="absolute top-0 right-0 flex flex-col gap-2">
                {variants.map((variant, i) => <div key={i} onClick={() => setSelectedVariant(variant)} className={cn('w-7 h-7 border rounded-full [box-shadow:0_0_9px_-1px_#ffffff85_inset] cursor-pointer', `bg-[${variant.color}]`)}></div>)}
            </div> */}
            <GlowButtonComponent
                variant={VaraintColor.indigo}
            >
                Scout
            </GlowButtonComponent>
        </div>
    )
}

export default GlowButton