"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface AuthLayoutProps {
  children: ReactNode;
  showRightPanel?: boolean;
}

export default function AuthLayout({ children, showRightPanel = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form (White Background) */}
      <div className="flex-1 bg-white flex flex-col">
        {/* Login Form Content */}
        <div className="flex-1 flex items-center justify-center px-8 pb-12 border border-[rgba(232,232,232,1)]">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>

      {/* Right Column - Branding Panel with AI Call Interface Image */}
      {showRightPanel && (
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">
          {/* Background Pattern - Grid Pattern */}
          {/* Main Grid */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(100, 99, 215, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100, 99, 215, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}
          />
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `
                radial-gradient(at 20% 30%, rgba(100, 99, 215, 0.2) 0px, transparent 50%),
                radial-gradient(at 80% 70%, rgba(135, 92, 233, 0.2) 0px, transparent 50%),
                radial-gradient(at 50% 50%, rgba(74, 60, 225, 0.15) 0px, transparent 60%)
              `
            }}
          />
          {/* Content Overlay */}
          <div className="relative z-20 flex flex-col justify-between p-12 h-full">
            {/* Top Section */}
            <div className="space-y-6">
            </div>
          </div>

          {/* Overlay Video */}
          <div 
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{
              left: '1px',
              top: '56px',
              justifyContent: 'flex-end',
              alignItems: 'flex-end'
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
              style={{
                clipPath: 'inset(10% 10% 10% 10%)',
                transform: 'scale(0.5)',
                transformOrigin: 'center center'
              }}
            >
              <source
                src="https://cdn.sanity.io/files/76tr0pyh/develop/3b0b48556f62074357d7fc3432949106e162f7a8.webm"
                type="video/webm"
              />
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
