"use client"
import { CircleQuestionMark, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"
import { useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import AddJobForm from "../AddFormJob";
import SendConcernForm from '@/components/ui/SendConcernsForm'
import LogoutButton from "../LogoutButton";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Jobs', href: '/jobs' },
  { name: 'Documents', href: '/documents' },
]

export default function TopBar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path

  const [isModalActive, updateModal] = useState(false);
  const [isAddJobOpen, setAddJobOpen] = useState(false)

  return (
    <header className="flex items-center gap-5 px-5 py-3 border-b bg-card">
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-700 shadow-sm">
          <svg viewBox="0 0 1024 1024" className="size-4.5 fill-primary-foreground" xmlns="http://www.w3.org/2000/svg">
            <path d="M813.7 210.3l-60.3 60.3c64.5 64.5 100 150.2 100 241.4 0 188.2-153.1 341.3-341.3 341.3S170.7 700.2 170.7 512c0-173.8 130.5-317.6 298.7-338.7v86.2C348.4 279.9 256 385.4 256 512c0 141.2 114.8 256 256 256s256-114.8 256-256c0-68.4-26.6-132.7-75-181l-60.3 60.3c32.2 32.2 50 75.1 50 120.7 0 94.1-76.5 170.7-170.7 170.7S341.3 606.1 341.3 512c0-79.4 54.5-146.3 128-165.3v91.4c-25.5 14.8-42.7 42.3-42.7 73.9 0 47.1 38.2 85.3 85.3 85.3s85.3-38.2 85.3-85.3c0-31.6-17.2-59.1-42.7-73.9V85.3h-85.3v2.1C254 108.9 85.3 291.1 85.3 512c0 235.3 191.4 426.7 426.7 426.7S938.7 747.2 938.7 512c0-113.9-44.4-221.1-125-301.7z" />
          </svg>
        </div>
        <span className="font-semibold text-sm text-foreground hidden sm:inline">WorkSpace</span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <Dialog open={isAddJobOpen} onOpenChange={setAddJobOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> <span className="hidden sm:inline">Add Application</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
          </DialogHeader>
          <AddJobForm onClose={() => setAddJobOpen(false)} />
        </DialogContent>
      </Dialog>

      <ThemeToggle />

      <Dialog open={isModalActive} onOpenChange={updateModal}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="px-2.5" aria-label="Help">
            <CircleQuestionMark className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send us your concerns</DialogTitle>
          </DialogHeader>
          <SendConcernForm onClose={() => updateModal(false)} />
        </DialogContent>
      </Dialog>

      <LogoutButton />
    </header>
  )
}
