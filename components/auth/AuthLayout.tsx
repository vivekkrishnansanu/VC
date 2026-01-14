"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AuthBackgroundShape from "@/assets/svg/auth-background-shape";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Advanced animated background layers */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
        
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.4] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px]" />
        
        {/* Decorative shape */}
        <div className="absolute top-0 right-0 w-full h-full opacity-30">
          <AuthBackgroundShape className="w-full h-full" />
        </div>
        
        {/* Radial gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--chart-2)/0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08),transparent_60%)]" />
      </div>

      {/* Top navigation bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <img
          src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_6YQQQr5c5yUDQKfyirHUrb7KDZfE"
          alt="VoiceStack"
          className="h-5 sm:h-6 w-auto"
          loading="eager"
        />
        <a
          href="mailto:support@voicestack.com"
          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:inline-flex items-center gap-1.5 group"
        >
          <span>Need help?</span>
          <span className="font-medium group-hover:underline">support@voicestack.com</span>
        </a>
      </div>

      {/* Centered auth card with enhanced styling */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="relative w-full max-w-lg">
          {/* Animated gradient border ring */}
          <div className="pointer-events-none absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 opacity-60 animate-pulse" />
          <div className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
          
          {/* Main card with glassmorphism effect */}
          <Card className={cn(
            "relative border-border/50 bg-card/95 backdrop-blur-xl",
            "shadow-2xl shadow-primary/5",
            "transition-all duration-300",
            "hover:shadow-2xl hover:shadow-primary/10",
            "border-2"
          )}>
            <CardHeader className="space-y-3 pb-6">
              <div className="space-y-1.5">
                <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="text-sm text-muted-foreground/90">
                    {description}
                  </CardDescription>
                )}
              </div>
              <Separator className="mt-2" />
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              {children}

              <div className="pt-4">
                <p className="text-center text-xs text-muted-foreground leading-relaxed">
                  By continuing, you agree to VoiceStack&rsquo;s{" "}
                  <a href="#" className="text-primary hover:underline font-medium">Terms</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

