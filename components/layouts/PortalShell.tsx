"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Bell, LogOut, Search, Settings2, ChevronRight, TrendingUp, TrendingDown, HelpCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/branding/Logo";

export interface PortalNavItem {
  title: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: PortalNavItem[];
}

export interface PortalNavGroup {
  title?: string;
  items: PortalNavItem[];
}

export interface PortalShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  nav: PortalNavItem[] | PortalNavGroup[];
  children: ReactNode;
  searchPlaceholder?: string;
  sidebarMetrics?: {
    label: string;
    value: string | number;
    color?: 'primary' | 'success' | 'warning' | 'destructive';
    trend?: { value: string; direction: 'up' | 'down' };
  }[];
  sidebarProgress?: {
    label: string;
    value: number;
    target?: number;
    color?: 'primary' | 'success' | 'warning' | 'destructive';
  };
}

export function PortalShell({
  title,
  description,
  actions,
  nav,
  children,
  searchPlaceholder = "Type to search...",
  sidebarMetrics,
  sidebarProgress,
}: PortalShellProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const renderNavItem = (item: PortalNavItem, level = 0) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={`${item.href}-${item.title}`} className={cn(level > 0 && "ml-3")}>
        <Link
          href={item.href}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
            active
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          {item.icon && (
            <span className={cn(
              "flex-shrink-0 transition-colors",
              active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
            )}>
              {item.icon}
            </span>
          )}
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="destructive" className="h-5 min-w-[1.25rem] px-1.5 text-[10px] font-bold bg-red-500">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
          {active && (
            <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 shadow-sm" />
          )}
        </Link>
        {hasChildren && (
          <div className="mt-1.5 space-y-1">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNavGroup = (group: PortalNavGroup) => {
    return (
      <div key={group.title || "main"} className="space-y-2">
        {group.title && (
          <div className="px-3.5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {group.title}
          </div>
        )}
        <div className="space-y-1">
          {group.items.map((item) => renderNavItem(item))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      <div className="mx-auto flex w-full max-w-screen-2xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col h-full w-full">
              {/* Premium Branding */}
              <div className="pb-8">
                <Logo size="md" variant="default" />
              </div>

              <Separator className="mb-6 bg-slate-100" />

              {/* Sidebar Metrics Cards */}
              {sidebarMetrics && sidebarMetrics.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {sidebarMetrics.map((metric, idx) => {
                    const colorClasses = {
                      primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border-blue-200/50',
                      success: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200/50',
                      warning: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border-amber-200/50',
                      destructive: 'bg-gradient-to-br from-red-50 to-rose-50 text-red-700 border-red-200/50',
                    };
                    const color = metric.color || 'primary';
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "rounded-2xl border p-4 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all",
                          colorClasses[color]
                        )}
                      >
                        <div className="text-[11px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{metric.label}</div>
                        <div className="text-2xl font-bold mb-1">{metric.value}</div>
                        {metric.trend && (
                          <div className={cn(
                            "flex items-center gap-1 text-[10px] font-semibold",
                            metric.trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                          )}>
                            {metric.trend.direction === 'up' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span>{metric.trend.value}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sidebar Progress Indicator */}
              {sidebarProgress && (
                <div className="mb-6 p-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 shadow-sm hover:shadow-md transition-shadow group/progress">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{sidebarProgress.label}</span>
                      <div className="relative group/tooltip">
                        <Info className="h-3 w-3 text-slate-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50">
                          <div className="bg-slate-900 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                            Overall completion across all locations
                            <div className="absolute left-2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {sidebarProgress.target && (
                      <span className="text-xs font-bold text-slate-900">
                        {sidebarProgress.value}%
                      </span>
                    )}
                  </div>
                  <Progress 
                    value={sidebarProgress.value} 
                    className="h-2.5 bg-slate-100 group-hover/progress:h-3 transition-all"
                  />
                  {sidebarProgress.target && (
                    <div className="text-[10px] text-slate-500 mt-2 font-medium">
                      Reached {sidebarProgress.value}% from {sidebarProgress.target}% target
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto -mx-2 px-2">
                {nav.map((item) => {
                  if ('items' in item) {
                    return renderNavGroup(item);
                  } else {
                    return renderNavItem(item);
                  }
                })}
              </nav>

              <Separator className="my-6 bg-slate-100" />

              {/* User Profile */}
              <div className="flex items-center gap-3 px-2 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60 text-sm font-bold text-slate-700">
                  {(user?.name ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "User"}</div>
                  <div className="truncate text-xs text-slate-500 font-medium">{user?.email ?? ""}</div>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium" 
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign out</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Topbar */}
          <div className="sticky top-0 z-10 -mx-4 px-4 pb-6 pt-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-lg group/search">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-500 transition-colors" />
                  <Input
                    aria-label="Search"
                    placeholder={searchPlaceholder}
                    className="pl-11 pr-10 h-11 bg-slate-50/50 border-slate-200/60 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
                  />
                  <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>

                {actions ? <div className="hidden md:block ml-auto">{actions}</div> : null}

                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50" aria-label="Settings">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  </Button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
                    {(user?.name ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(title || description) && (
            <div className="mb-8 mt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {title ? (
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
                      {title}
                    </h1>
                  ) : null}
                  {description ? (
                    <p className="text-base text-slate-600 font-medium leading-relaxed">
                      {description}
                    </p>
                  ) : null}
                </div>
                {description && (
                  <div className="relative group/help shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      aria-label="Help"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-2 hidden group-hover/help:block z-50 w-64">
                      <div className="bg-slate-900 text-white text-sm rounded-xl px-4 py-3 shadow-2xl">
                        <p className="font-semibold mb-1">Need help?</p>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Use the search bar to find specific accounts or locations. Click on any card to view detailed information.
                        </p>
                        <div className="absolute right-4 top-0 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900 -translate-y-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {actions ? <div className="mb-6 md:hidden">{actions}</div> : null}

          {children}
        </main>
      </div>
    </div>
  );
}

