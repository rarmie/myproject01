import type { Metadata } from "next";
import TopBar from "@/components/ui/TopBar";

export const metadata: Metadata = {
  title: "WorkSpace - Job Tracker",
  description: "Track your job applications with ease",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-full w-full flex flex-col">
      <TopBar />
      <main className="flex-1 bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
