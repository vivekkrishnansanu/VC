"use client";

import { ReactNode } from "react";
import AuthBackgroundShape from "@/assets/svg/auth-background-shape";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AuthBackgroundShape className="opacity-30" />
      </div>

      {/* Desktop: Two-column layout */}
      <div className="relative z-10 w-full max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Branding (hidden on mobile) */}
          <div className="hidden flex-col justify-center space-y-6 lg:flex">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Onboarding & Enablement
              </h1>
              <p className="text-lg text-muted-foreground">
                Enterprise-grade internal platform for onboarding and enablement
              </p>
            </div>
          </div>

          {/* Right: Auth card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-lg">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Header branding */}
      <div className="absolute top-8 left-8 z-10 lg:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Onboarding & Enablement</h1>
      </div>
    </div>
  );
}

