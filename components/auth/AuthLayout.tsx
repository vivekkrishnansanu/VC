"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Untitled-style background: subtle grid + gradient wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-muted/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--chart-2)/0.14),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      {/* Top bar */}
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <img
          src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_6YQQQr5c5yUDQKfyirHUrb7KDZfE"
          alt="VoiceStack"
          className="h-6 w-auto"
          loading="eager"
        />
        <a
          href="mailto:support@voicestack.com"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Need help? <span className="font-medium">support@voicestack.com</span>
        </a>
      </div>

      {/* Centered auth card */}
      <div className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl items-center justify-center px-6 pb-12">
        <div className="relative w-full max-w-md">
          {/* crisp ring like Untitled */}
          <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-primary/25 via-primary/10 to-transparent" />
          <Card className={cn("relative border-border/60 bg-background/80 backdrop-blur", "shadow-xl hover:shadow-xl")}>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
              {description ? <CardDescription>{description}</CardDescription> : null}
              <Separator className="mt-4" />
            </CardHeader>

            <CardContent className="space-y-6">
              {children}

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to VoiceStack&rsquo;s Terms and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

