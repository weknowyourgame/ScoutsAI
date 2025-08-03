"use client";
import React from 'react'
import FloatingMenuComponent from './ui/floating-menu'
import { CircleQuestionMark, Mail, Search } from 'lucide-react';

const FloatingMenu = () => {
    const NavLinks = [
        { icon: CircleQuestionMark, color: "#fff", href: "#", type: 'about' as const },
        { icon: Mail, color: "#fff", href: "#", type: 'mail' as const },
        { icon: Search, color: "#fff", href: "#", type: 'scouts' as const },
    ];
    
    return (
        <div className="relative size-full flex-1  flex items-center justify-center">
            <FloatingMenuComponent
                navLinks={NavLinks}
                bgColor="bg-neutral-800"
                itemsColor="text-neutral-500"
            />
        </div>
    )
}

export default FloatingMenu  