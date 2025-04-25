import { Search } from "lucide-react"
import { UserNav } from "./user-nav"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Image 
            src="/logo.svg" 
            alt="QuickPilot" 
            width={32} 
            height={32} 
          />
          <span className="text-xl font-bold">QuickPilot</span>
        </div>
        
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search documents..."
            className="h-9 md:w-[300px] lg:w-[400px]"
          />
        </div>

        <UserNav />
      </div>
    </header>
  )
} 