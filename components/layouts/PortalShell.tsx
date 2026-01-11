"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface PortalNavItem {
  title: string;
  href: string;
  icon?: ReactNode;
}

export interface PortalShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  nav: PortalNavItem[];
  children: ReactNode;
}

export function PortalShell({ title, description, actions, nav, children }: PortalShellProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6">
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_6YQQQr5c5yUDQKfyirHUrb7KDZfE"
                  alt="VoiceStack"
                  className="h-5 w-auto"
                  loading="eager"
                />
              </div>

              <Separator className="my-4" />

              <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Navigation
              </div>
              <nav className="space-y-1">
                {nav.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted",
                        active && "bg-muted text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "text-muted-foreground",
                          active && "text-foreground"
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.title}</span>
                      {active ? (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <Separator className="my-4" />

              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {(user?.name ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{user?.name ?? "User"}</div>
                  <div className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</div>
                </div>
              </div>

              <div className="mt-3 px-2">
                <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {(title || actions) && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {title ? <h1 className="text-3xl font-semibold tracking-tight">{title}</h1> : null}
                {description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

