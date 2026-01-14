'use client';

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in"
      description="Use your work email to access onboarding and implementation tools."
    >
      <LoginForm />
    </AuthLayout>
  );
}

