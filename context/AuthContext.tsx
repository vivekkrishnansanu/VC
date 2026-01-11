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
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (userData: User) => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authSignIn(userData);
      setUser(authenticatedUser);
      
      // Route based on user role (mock for now - in production, get from user data)
      // For demo: check email to determine role
      const isImplementationLead = authenticatedUser.email.includes('@company.com') || 
                                   authenticatedUser.email.includes('implementation');
      
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        if (isImplementationLead) {
          router.push("/implementation-lead/dashboard");
        } else {
          router.push("/customer/dashboard");
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

