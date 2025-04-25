import { Inter } from "next/font/google"
import { Metadata } from "next"
import "./globals.css"
import { TopNav } from "@/components/layout/top-nav"
import { Sidebar } from "@/components/layout/sidebar"
import ClientChatBubble from "../components/ClientChatBubble"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QuickPilot",
  description: "AI-Powered Document Automation",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        <ClientChatBubble />
      </body>
    </html>
  )
}
