'use client';

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/layouts/PortalShell";
import { LayoutDashboard, Users, Building } from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading]); // Removed router from dependencies

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Determine role based on email (temporary - until we have role in user data)
  const isImplementationLead = user.email.includes('@company.com') || 
                               user.email.includes('implementation');

  return (
    <PortalShell
      title="Dashboard"
      description="Welcome to the onboarding platform."
      nav={[
        { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        { title: "Accounts", href: isImplementationLead ? "/implementation-lead/dashboard" : "/customer/dashboard", icon: <Building className="h-4 w-4" /> },
        { title: "Users", href: "/dashboard", icon: <Users className="h-4 w-4" /> },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>
      }
    >
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle>Signed in</CardTitle>
          <CardDescription>Quick links based on your role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {isImplementationLead ? (
              <Link href="/implementation-lead/dashboard">
                <Button>Go to Implementation Lead Dashboard</Button>
              </Link>
            ) : (
              <Link href="/customer/dashboard">
                <Button>Go to Customer Dashboard</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </PortalShell>
  );
}
