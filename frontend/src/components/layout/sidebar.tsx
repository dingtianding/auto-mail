"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path;

  const NavItem = ({ href, icon: Icon, children, disabled = false }: { 
    href: string; 
    icon: any; 
    children: React.ReactNode;
    disabled?: boolean;
  }) => {
    const Component = disabled ? 'div' : Link;
    return (
      <Component 
        {...(!disabled && { href })}
        className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
          isActive(href) 
            ? 'bg-[#2D2B3F] text-white' 
            : disabled 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'text-gray-400 hover:bg-[#2D2B3F] hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm">{children}</span>
      </Component>
    );
  };

  return (
    <aside className="w-64 bg-[#1D1B2F] h-screen text-white flex flex-col">
      <nav className="space-y-0.5 pt-4 flex-1">
        <NavItem href="/dashboard" icon={LayoutDashboard}>
          DASHBOARD
        </NavItem>

        <div className="pt-4 pb-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
            Accounts Receivable
          </div>
        </div>
        <NavItem href="/customers" icon={Users}>
          Customers
        </NavItem>

        <div className="pt-4 pb-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
            Accounts Payable
          </div>
        </div>
        <NavItem href="/vendors" icon={Building2} disabled>
          Vendors
        </NavItem>

        <div className="pt-4 pb-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
            Analytics
          </div>
        </div>
        <NavItem href="/reports" icon={FileText} disabled>
          Reports
        </NavItem>
        
        <div className="pt-4 pb-2">
          <div className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">
            System
          </div>
        </div>
        <NavItem href="/settings" icon={Settings}>
          Settings
        </NavItem>
      </nav>
    </aside>
  )
} 