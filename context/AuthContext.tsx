"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn as authSignIn, signOut as authSignOut, getCurrentUser, type User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from storage
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (userData: User) => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authSignIn(userData);
      setUser(authenticatedUser);
      
      // Set auth cookie for server-side access
      if (typeof document !== 'undefined') {
        // Encode the JSON to avoid issues with special characters
        const encodedUser = encodeURIComponent(JSON.stringify(authenticatedUser));
        document.cookie = `auth=${encodedUser}; path=/; max-age=86400; SameSite=Lax`; // 24 hours
      }
      
      // Route based on user role (mock for now - in production, get from user data)
      // For demo: check email to determine role
      const isImplementationLead = authenticatedUser.email.includes('@company.com') || 
                                   authenticatedUser.email.includes('implementation');
      
      // Use setTimeout to avoid state update during render
      setTimeout(async () => {
        if (isImplementationLead) {
          router.push("/implementation-lead/dashboard");
        } else {
          // For customers, redirect to their first account instead of dashboard
          try {
            const { mockDataService } = await import('@/lib/mock-data/service');
            const customerId = authenticatedUser.id;
            const customerLocations = mockDataService.locations.getByCustomerId(customerId);
            
            // If no locations found, try getting all locations for demo
            if (customerLocations.length === 0) {
              customerLocations.push(...mockDataService.locations.getAll().slice(0, 3));
            }
            
            // Get unique account IDs
            const accountIds = [...new Set(customerLocations.map(loc => loc.accountId))];
            
            if (accountIds.length > 0) {
              // Redirect to first account's detail page
              router.push(`/customer/account/${accountIds[0]}`);
            } else {
              // No accounts found, fallback to dashboard
              router.push("/customer/dashboard");
            }
          } catch (error) {
            console.error('Error redirecting customer:', error);
            // Fallback to dashboard on error
            router.push("/customer/dashboard");
          }
        }
      }, 0);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const signOut = useCallback(() => {
    authSignOut();
    setUser(null);
    
    // Clear auth cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'auth=; path=/; max-age=0';
    }
    
    // Use setTimeout to avoid state update during render
    setTimeout(() => {
      router.push("/login");
    }, 0);
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

