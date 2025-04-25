"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TopNav() {
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">QuickPilot</span>
        </Link>
        
        <div className="ml-auto flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Search..."
            className="w-[200px] lg:w-[300px]"
          />
          
          <Button variant="outline" size="sm">
            Profile
          </Button>
        </div>
      </div>
    </header>
  )
} 