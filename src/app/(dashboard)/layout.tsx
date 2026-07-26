"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Star, Send, Trash2, Settings, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: 3 },
  { href: "#", label: "Starred", icon: Star },
  { href: "#", label: "Sent", icon: Send },
  { href: "#", label: "Trash", icon: Trash2 },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-[260px] h-full flex flex-col border-r border-border bg-muted/30 shrink-0">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-foreground text-background font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-foreground text-[15px] tracking-tight">
              Mail Assistant
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-2">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200
                    ${isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`
                        text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center
                        ${isActive
                          ? "bg-background/20 text-background"
                          : "bg-foreground/10 text-muted-foreground"
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 border-none bg-transparent cursor-pointer">
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
