import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  Settings,
  ChevronDown
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText
    },
    {
      name: 'Email',
      href: '/email',
      icon: Mail
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      submenu: [
        {
          name: 'General',
          href: '/settings'
        },
        {
          name: 'AI Prompts',
          href: '/settings/prompts'
        },
        {
          name: 'API Keys',
          href: '/settings/api-keys'
        }
      ]
    }
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                pathname === item.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {item.icon && <item.icon className="mr-3 h-5 w-5" />}
              {item.name}
              {item.submenu && <ChevronDown className="ml-auto h-4 w-4" />}
            </Link>
            
            {item.submenu && (
              <div className="ml-6 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "block px-4 py-2 text-sm font-medium rounded-md",
                      pathname === subItem.href
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 