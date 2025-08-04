"use client"
import { useState } from "react"
import {
    Dialog as DialogComponent,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { redirect } from "next/navigation"
import SignInModal from "./ui/sign-in"
// import AllScouts from "./ActiveScouts"

interface DialogProps {
    children: React.ReactNode
    type?: 'home' | 'mail' | 'user' | 'scouts' | 'about'
}

const Dialog = ({ children, type = 'mail' }: DialogProps) => {
    const [contactFormData, setContactFormData] = useState({
        email: "",
        name: "",
        message: ""
    })

    const [userFormData, setUserFormData] = useState({
        email: "",
        name: "",
        phone: "",
        company: ""
    })

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Contact form submitted:", contactFormData)
        // Handle contact form submission here
    }

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("User form submitted:", userFormData)
        // Handle user form submission here
    }

    const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setContactFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setUserFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const renderDialogContent = () => {
        switch (type) {
            case 'about':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>About Scouts AI</DialogTitle>
                            <DialogDescription>
                                Your intelligent web automation and research assistant
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-500">What is Scouts AI?</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Scouts AI is an intelligent automation platform that helps you research, gather information, 
                                    and automate web tasks. Think of it as your personal AI assistant that can browse the web, 
                                    analyze data, and complete complex tasks for you.
                                </p>
                                
                                <h4 className="font-semibold text-gray-500 mt-4">Key Features</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• <strong>Web Research:</strong> Automatically search and gather information from multiple sources</li>
                                    <li>• <strong>Data Analysis:</strong> Process and summarize large amounts of data</li>
                                    <li>• <strong>Task Automation:</strong> Execute complex workflows and repetitive tasks</li>
                                    <li>• <strong>Real-time Monitoring:</strong> Track progress and get updates on your scouts</li>
                                </ul>
                                
                                <h4 className="font-semibold text-gray-500 mt-4">How it Works</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Simply ask Scouts AI what you need, and it will create a series of automated tasks to 
                                    accomplish your goal. Each scout can handle multiple tasks, from simple web searches to 
                                    complex data analysis and reporting.
                                </p>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-500 mb-3">Connect with the Creator</h4>
                                <div className="space-y-2">
                                    <a 
                                        href="https://x.com/0xsarthakk" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                        Follow on X (Twitter)
                                    </a>
                                    <a 
                                        href="https://sarthakkapila.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                        </svg>
                                        Visit Website
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                )
            
            case 'home':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Home</DialogTitle>
                            <DialogDescription>
                                Welcome to Scouts AI. This is your home dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                You're currently on the home page. Use the menu to navigate to different sections.
                            </p>
                        </div>
                    </>
                )
            
            case 'user':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>User Profile</DialogTitle>
                            <DialogDescription>
                                Manage your user account and preferences.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                User profile management coming soon.
                            </p>
                        </div>
                    </>
                )
            
            case 'scouts':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>All Scouts</DialogTitle>
                            <DialogDescription>
                                View all scouts ever created and their progress.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            {/* <AllScouts /> */}
                        </div>
                    </>
                )
            
            case 'mail':
            default:
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Email</DialogTitle>
                            <DialogDescription>
                                To receive updates on your scouts enter your email below.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Email</Label>
                                <Input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    value={contactFormData.email}
                                    onChange={handleContactInputChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <Button type="submit" className="bg-indigo-900 hover:bg-indigo-800">
                                Submit
                            </Button>
                        </form>
                    </>
                )
        }
    }

    return (
        <DialogComponent>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {renderDialogContent()}
            </DialogContent>
        </DialogComponent>
    )
}

export default Dialog