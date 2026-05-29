"use client"
import { Briefcase, FileText, Icon, icons, LayoutDashboard, CircleQuestionMark, X, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"
import { useRef, useState } from "react";
import { Button } from "./button";
import emailjs from "@emailjs/browser"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import AddJobForm from "../AddFormJob";
import SendConcernForm from '@/components/ui/SendConcernsForm'
import LogoutButton from "../LogoutButton";


export default function Sidebar(){

    const pathname = usePathname();
    const isActive = (path: string) => pathname === path
    const navItems = [
        {name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard},
        {name: 'Jobs', href: '/jobs', icon: Briefcase},
        {name: 'Documents', href: '/documents', icon: FileText}
    ]

    const [isModalActive, updateModal] = useState(false);

    
    const formref = useRef<HTMLFormElement>(null)
    const [formStatus, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle")


    const [isAddJobOpen, setAddJobOpen] = useState(false)

    return(
        <aside className="w-64 shadow-sm  flex flex-col h-screen bg-gray-50">
            <header className="flex justify-start m-6">
                <div>
                    <img src="/124-job-tracking.svg" className="w-13 h-13"/>
                </div>
                <div className="ms-1">
                    <h1 className="text-3xl font-medium">WorkSpace</h1>
                    <p className="text-xs font-light">Hired starts here</p>
                </div>
                
            </header>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center p-3 rounded-md transition-colors ${
                        isActive(item.href)
                        ? "bg-gray-900 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-200 bg-gray-50"
                    }`}
                    >
                        <item.icon className="size-5 me-3"/>
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="flex-1 mx-auto">
                <Dialog open = {isAddJobOpen} onOpenChange={setAddJobOpen}>
                    <DialogTrigger>
                        <button className="flex justify-center items-center bg-blue-900 text-white rounded-md mx-auto py-2 px-8 mb-2">
                            <Plus className="size-4"/> Add New Application
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Add New Job
                            </DialogTitle>
                        </DialogHeader>
                        <AddJobForm onClose = {() => setAddJobOpen(false)}/>
                    </DialogContent>
                </Dialog>
            </div>
            
            <LogoutButton/>
            <footer className="bottom-0 left-0 flex p-3">
                <Dialog open={isModalActive} onOpenChange={updateModal}>
                    <DialogTrigger>
                        <Button className="bg-transparent text-gray-500 text-md">
                            <CircleQuestionMark className="size-5 me-2"/> Help
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Send us your concerns
                            </DialogTitle>
                        </DialogHeader>

                        <SendConcernForm onClose = {() => updateModal(false)} />
                    </DialogContent>
                </Dialog>
            </footer>
        </aside>
    )
}