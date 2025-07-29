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
             redirect('/home')
            
            case 'user':
                redirect('/scouts')
            
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