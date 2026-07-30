"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox, Star, Send, Trash2, Settings, Sparkles, LogOut,
  Activity, Menu, X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/summary", label: "Summary", icon: Activity },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: 3 },
  { href: "/starred", label: "Starred", icon: Star },
  { href: "/sent", label: "Sent", icon: Send },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Desktop: collapsed (icon-only) or expanded
  const [collapsed, setCollapsed] = useState(false);

  // Mobile: open overlay or hidden
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">

      {/* ── Mobile overlay ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────── */}
      <aside
        className={`
          flex flex-col h-full border-r border-border bg-background shrink-0
          transition-all duration-300 ease-in-out
          /* Mobile: fixed overlay, always full-width */
          fixed md:static inset-y-0 left-0 z-40
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-[60px]" : "md:w-[240px]"}
          w-[240px]
        `}
      >
        {/* ── Logo + Toggle ── */}
        {collapsed ? (
          /* Collapsed: stack vertically — hamburger di atas, logo di bawah */
          <div className="flex flex-col items-center gap-2 border-b border-border shrink-0 py-3">
            {/* Desktop hamburger toggle */}
            <button
              onClick={() => setCollapsed(false)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer bg-transparent border-none"
              aria-label="Expand sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            {/* Logo icon */}
            <Link
              href="/"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-foreground text-background hover:scale-105 transition-transform"
              title="Mail Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Expanded: logo kiri, hamburger + close kanan */
          <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
            <Link href="/" className="flex items-center gap-2.5 no-underline group min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-foreground text-background shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-foreground text-[14px] tracking-tight truncate">
                Mail Assistant
              </span>
            </Link>
            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer bg-transparent border-none shrink-0"
              aria-label="Collapse sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer bg-transparent border-none"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-0.5 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.label} className="relative group/item">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg text-sm font-medium no-underline
                      transition-all duration-200 overflow-hidden
                      ${collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : "px-3 py-2.5 w-full"}
                      ${isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`
                              text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0
                              ${isActive
                                ? "bg-background/20 text-background"
                                : "bg-foreground/10 text-muted-foreground"
                              }
                            `}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>

                  {/* Tooltip on collapsed */}
                  {collapsed && (
                    <div className="
                      pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50
                      hidden md:flex items-center gap-2
                      opacity-0 group-hover/item:opacity-100 transition-opacity duration-150
                    ">
                      <div className="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        {item.label}
                        {item.badge && (
                          <span className="ml-1.5 bg-background/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-foreground absolute -left-1 top-1/2 -translate-y-1/2 rotate-180" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* ── Bottom actions ── */}
        <div className="px-2 pb-4 space-y-0.5 border-t border-border pt-3">
          {/* Settings */}
          <div className="relative group/settings">
            <Link
              href="/settings"
              className={`
                flex items-center gap-3 rounded-lg text-sm font-medium no-underline
                transition-all duration-200
                ${pathname === "/settings"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
                ${collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : "px-3 py-2.5 w-full"}
              `}
            >
              <Settings className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
            {collapsed && (
              <div className="
                pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50
                hidden md:flex items-center
                opacity-0 group-hover/settings:opacity-100 transition-opacity duration-150
              ">
                <div className="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  Settings
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="relative group/logout">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`
                flex items-center gap-3 rounded-lg text-sm font-medium
                text-red-500 hover:text-red-600 hover:bg-red-50/10
                transition-all duration-200 cursor-pointer bg-transparent border-none
                ${collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : "px-3 py-2.5 w-full"}
              `}
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
            {collapsed && (
              <div className="
                pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50
                hidden md:flex items-center
                opacity-0 group-hover/logout:opacity-100 transition-opacity duration-150
              ">
                <div className="bg-red-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer border-none bg-transparent"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-foreground text-background">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-foreground text-[14px] tracking-tight">
              Mail Assistant
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
