"use client"

import { TopNav } from "@/components/layout/top-nav"
import { Sidebar } from "@/components/layout/sidebar"
import { AIChatPopup } from "@/components/chat/ai-chat"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <AIChatPopup />
    </div>
  )
}