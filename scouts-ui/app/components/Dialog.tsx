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

interface DialogProps {
    children: React.ReactNode
    type?: 'home' | 'mail' | 'user'
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
            case 'home':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Welcome to ScoutsAI</DialogTitle>
                            <DialogDescription>
                                Get started with our AI-powered scouting platform.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">What we offer:</h3>
                                <ul className="space-y-1 text-sm">
                                    <li>• AI-powered talent scouting</li>
                                    <li>• Advanced analytics and insights</li>
                                    <li>• Real-time performance tracking</li>
                                    <li>• Custom reporting tools</li>
                                </ul>
                            </div>
                            <div className="flex justify-end">
                                <Button className="bg-indigo-900 hover:bg-indigo-800">
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </>
                )
            
            case 'user':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Create Account</DialogTitle>
                            <DialogDescription>
                                Sign up for a new ScoutsAI account.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-name">Full Name</Label>
                                <Input
                                    id="user-name"
                                    name="name"
                                    value={userFormData.name}
                                    onChange={handleUserInputChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-email">Email</Label>
                                <Input
                                    id="user-email"
                                    name="email"
                                    type="email"
                                    value={userFormData.email}
                                    onChange={handleUserInputChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-phone">Phone Number</Label>
                                <Input
                                    id="user-phone"
                                    name="phone"
                                    type="tel"
                                    value={userFormData.phone}
                                    onChange={handleUserInputChange}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-company">Company</Label>
                                <Input
                                    id="user-company"
                                    name="company"
                                    value={userFormData.company}
                                    onChange={handleUserInputChange}
                                    placeholder="Enter your company name"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="submit" className="bg-indigo-900 hover:bg-indigo-800">
                                    Create Account
                                </Button>
                            </div>
                        </form>
                    </>
                )
            
            case 'mail':
            default:
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Contact Us</DialogTitle>
                            <DialogDescription>
                                Send us a message and we'll get back to you as soon as possible.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact-name">Name</Label>
                                <Input
                                    id="contact-name"
                                    name="name"
                                    value={contactFormData.name}
                                    onChange={handleContactInputChange}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
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
                            <div className="space-y-2">
                                <Label htmlFor="contact-message">Message</Label>
                                <Textarea
                                    id="contact-message"
                                    name="message"
                                    value={contactFormData.message}
                                    onChange={handleContactInputChange}
                                    placeholder="Enter your message"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="submit" className="bg-indigo-900 hover:bg-indigo-800">
                                    Send Message
                                </Button>
                            </div>
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