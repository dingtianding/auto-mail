'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'General',
      href: '/settings',
    },
    {
      name: 'AI Prompts',
      href: '/settings/prompts',
    },
    {
      name: 'API Keys',
      href: '/settings/api-keys',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="flex gap-6">
        <div className="w-64">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
} 