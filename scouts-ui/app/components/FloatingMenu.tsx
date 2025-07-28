"use client";
import React from 'react'
import FloatingMenuComponent from './ui/floating-menu'
import { Home, Mail, User } from 'lucide-react';

const FloatingMenu = () => {
    const NavLinks = [
        { icon: Home, color: "#fff", href: "#" },
        { icon: Mail, color: "#fff", href: "#" },
        { icon: User, color: "#fff", href: "#" },
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