import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showInSidebar?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    showInSidebar: true,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    showInSidebar: true,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    showInSidebar: true,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
    showInSidebar: true,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    showInSidebar: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block md:w-64">
      <div className="flex h-full flex-col">
        <div className="p-4">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">QuickPilot</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4 flex-1">
          {navItems
            .filter(item => item.showInSidebar !== false)
            .map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
        </nav>
      </div>
    </div>
  )
} 