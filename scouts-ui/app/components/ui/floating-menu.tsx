'use client'
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Mail, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'
import Dialog from '../Dialog';

interface NavLinkItem {
    icon: React.ElementType,
    color?: string,
    href: string,
    type: 'home' | 'mail' | 'user'
}

const defaultNavLinks = [
    { icon: Home, color: "#fff", href: "#", type: 'home' as const },
    { icon: Mail, color: "#fff", href: "#", type: 'mail' as const },
    { icon: User, color: "#fff", href: "#", type: 'user' as const },
];

const FloatingMenuComponent = ({
    navLinks = defaultNavLinks,
    bgColor = "bg-neutral-800",
    classNameMain,
    classNameItems,
    itemsColor = "text-neutral-500",
    gooeyBorderColor = "#565656"
}: {
    navLinks?: NavLinkItem[]
    bgColor?: string
    classNameMain?: string
    classNameItems?: string
    itemsColor?: string
    gooeyBorderColor?: string
}
) => {

    const [ismenuOpen, setIsMenuOpen] = useState(false);

    const angleIncrement = 70;

    const radius = 40;
    const startAngle = -160;

    return (
        <>
            <SVGGooeyFilter />
            <StrokeFilter gooeyBorderColor={gooeyBorderColor} />
            <div
                className="relative"
                style={{ filter: "url(#gooey-effect) url(#gooey-stroke)" }}
            >
                <button
                    className={cn("relative w-16 h-16 flex items-center justify-center rounded-xl cursor-pointer", bgColor, classNameMain)}
                    onClick={() => setIsMenuOpen(!ismenuOpen)}
                    style={{ zIndex: 50 }}
                >
                    <AnimatePresence mode="wait">
                        {ismenuOpen ? (
                            <motion.div
                                key="x"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <X className="w-5 h-5 " />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Menu className="w-5 h-5 " />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <AnimatePresence mode="wait">
                    {ismenuOpen && (
                        <div>
                            {navLinks.map((item, _i) => {
                                const Icon = item.icon;
                                const angle = startAngle + _i * angleIncrement;
                                const x = radius * Math.cos((angle * Math.PI) / 180);
                                const y = radius * Math.sin((angle * Math.PI) / 180);

                                return (
                                    <Dialog key={_i} type={item.type}>
                                        <motion.button
                                            className={cn("absolute w-12 h-12 rounded-full flex items-center justify-center hover:text-black cursor-pointer transition-colors duration-200 p-1.5", itemsColor, bgColor, classNameItems)}
                                            style={{
                                                top: "-20%",
                                                right: "-110%",
                                            }}
                                            initial={{ opacity: 0, x: -58, y: 10 }}
                                            animate={{
                                                opacity: 1,
                                                x: x,
                                                y: y,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                x: -85,
                                                y: 10,
                                                transition: {
                                                    duration: 0.2,
                                                    delay: (navLinks.length - _i) * 0.04,
                                                },
                                            }}
                                            transition={{
                                                duration: 0.2,
                                                delay: _i * 0.05,
                                            }}
                                            whileHover={{
                                                scale: 1.2,
                                                transition: { duration: 0.3, ease: "easeInOut" },
                                            }}
                                            whileTap={{
                                                scale: 0.9,
                                            }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                                        </motion.button>
                                    </Dialog>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}

export default FloatingMenuComponent


const SVGGooeyFilter = () => {
    return (
        <svg className="hidden absolute">
            <defs>
                <filter id="gooey-effect">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={3} result="blur" />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  
                    0 1 0 0 0 
                    0 0 1 0 0  
                    0 0 0 21 -3"
                        result="gooey"
                    />
                    <feBlend in="SourceGraphic" in2="gooey" />
                </filter>
            </defs>
        </svg>
    );
};

const StrokeFilter = ({gooeyBorderColor = "#565656"}: {gooeyBorderColor?: string}) => {
    return (
        <svg width="0" height="0">
            <filter id="gooey-stroke" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />

                <feColorMatrix
                    in="blur"
                    type="matrix"
                    result="goo"
                    values="1 0 0 0 0  
              0 1 0 0 0  
              0 0 1 0 0  
              0 0 0 15 -9"
                />

                <feMorphology in="goo" operator="dilate" radius="2.5" result="strokeOuter" />

                <feComposite in="strokeOuter" in2="goo" operator="out" result="stroke" />

                <feFlood floodColor={gooeyBorderColor} result="strokeColor" />
                <feComposite in="strokeColor" in2="stroke" operator="in" result="coloredStroke" />

                <feMerge>
                    <feMergeNode in="coloredStroke" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </svg>
    );
};