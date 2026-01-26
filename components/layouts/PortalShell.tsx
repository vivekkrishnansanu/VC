"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { Bell, LogOut, Settings2, HelpCircle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/branding/Logo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  const breadcrumbs = useBreadcrumbs({ userRole: user?.role });

  const renderNavItem = (item: PortalNavItem, level = 0) => {
    // More precise active state: exact match or pathname starts with href followed by / or end of string
    const isExactMatch = pathname === item.href;
    const isSubPath = pathname.startsWith(item.href + "/") && item.href !== "/";
    const active = isExactMatch || isSubPath;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={`${item.href}-${item.title}`} className={cn(level > 0 && "ml-4")}>
        <Link
          href={item.href}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            active
              ? "text-slate-900 font-semibold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
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
            <Badge variant="destructive" className="h-4.5 min-w-[1.25rem] px-1.5 text-[10px] font-semibold bg-red-500">
              {item.badge}
            </Badge>
          )}
          {active && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
          )}
        </Link>
        {hasChildren && (
          <div className="mt-0.5 ml-4 space-y-0.5 border-l border-slate-100 pl-2">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNavGroup = (group: PortalNavGroup) => {
    return (
      <div key={group.title || "main"} className="space-y-1">
        {group.title && (
          <div className="px-3.5 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {group.title}
          </div>
        )}
        <div className="space-y-0.5">
          {group.items.map((item) => renderNavItem(item))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-screen-2xl">
        {/* Main */}
        <main className="w-full bg-white">
          {/* Topbar */}
          <div 
            className="sticky top-0 z-50 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pt-4 pb-4"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)',
              paddingBottom: '0px'
            }}
          >
            <div className="rounded-xl border border-slate-200/60 bg-white backdrop-blur-xl p-3.5 lg:rounded-2xl lg:p-4" style={{ backdropFilter: 'blur(32px)', boxShadow: 'none' }}>
              <div className="flex items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Logo size="md" variant="default" />
                </div>

                <div className="flex items-center gap-3">
                  {actions ? <div className="hidden md:block">{actions}</div> : null}

                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50" aria-label="Settings">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  </Button>
                  
                  {/* User Profile */}
                  <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60 text-sm font-bold text-slate-700 flex-shrink-0">
                      {(user?.name ?? "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <div className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "User"}</div>
                      <div className="truncate text-xs text-slate-500 font-medium">{user?.email ?? ""}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-8 px-3 rounded-lg whitespace-nowrap" 
                      onClick={signOut}
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1.5" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-white">
            {(title || description) && (
              <div className="mb-6 mt-4 lg:mb-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {title ? (
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5 lg:text-3xl lg:mb-2">
                        {title}
                      </h1>
                    ) : null}
                    {description ? (
                      <p className="text-sm text-slate-600 font-medium leading-relaxed lg:text-base">
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

            {actions ? <div className="mb-4 md:hidden lg:mb-6">{actions}</div> : null}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

