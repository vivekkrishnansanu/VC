"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { UserRole } from "@/types";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  fullName: z
    .string()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .email("Please enter a valid work email address")
    .regex(
      /@.+\./,
      "Please use your work email address"
    ),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    fullName: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});

  const validateField = (field: keyof LoginFormData, value: string) => {
    try {
      loginSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0]?.message }));
      }
      return false;
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ fullName: true, email: true });

    // Validate entire form
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const name = result.data.fullName.trim();
      const role =
        result.data.email.includes("@company.com") ||
        result.data.email.includes("implementation")
          ? UserRole.IMPLEMENTATION_LEAD
          : UserRole.CUSTOMER;

      await signIn({
        id: `user-${Date.now()}`,
        name: name || "User",
        email: result.data.email,
        role,
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const validationResult = loginSchema.safeParse(formData);
  const isFormValid = validationResult.success && !isSubmitting;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Branding Area */}
      <div className="flex items-center gap-2 mb-6" style={{ gap: '8px' }}>
        <img
          src="https://voicestack.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvoicestack-logo.91a9d9aa.svg&w=384&q=75&dpl=dpl_6YQQQr5c5yUDQKfyirHUrb7KDZfE"
          alt="VoiceStack"
          style={{ width: '128px', height: '64px' }}
          loading="eager"
        />
      </div>

      {/* Welcome Message */}
      <div style={{ marginBottom: '24px' }}>
        <h2 
          className="font-bold text-black"
          style={{ fontSize: '30px', marginBottom: '8px', marginTop: '8px' }}
        >
          Welcome Back
        </h2>
        <p 
          className="font-normal"
          style={{ fontSize: '16px', color: '#4B5563' }}
        >
          The Most Advanced Enterprise Phone System! 
        </p>
      </div>

      {/* Separator */}
      <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
        <Separator className="flex-1" />
        <Separator className="flex-1" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        {/* Full Name Field */}
        <div style={{ marginBottom: '16px' }}>
          <Label 
            htmlFor="fullName" 
            className="font-bold text-black block"
            style={{ fontSize: '14px', marginBottom: '8px' }}
          >
            Full name<span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
            className={cn(
              "w-full border-gray-300 focus:border-primary focus:ring-primary rounded-md",
              touched.fullName && errors.fullName && "border-destructive"
            )}
            style={{ height: '40px', fontSize: '16px' }}
          />
          {touched.fullName && errors.fullName && (
            <p className="text-sm text-destructive" style={{ marginTop: '4px' }}>{errors.fullName}</p>
          )}
        </div>

        {/* Work Email Field */}
        <div style={{ marginBottom: '16px' }}>
          <Label 
            htmlFor="email" 
            className="font-bold text-black block"
            style={{ fontSize: '14px', marginBottom: '8px' }}
          >
            Work email<span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={cn(
              "w-full border-gray-300 focus:border-primary focus:ring-primary rounded-md",
              touched.email && errors.email && "border-destructive"
            )}
            style={{ height: '40px', fontSize: '16px' }}
          />
          {touched.email && errors.email && (
            <p className="text-sm text-destructive" style={{ marginTop: '4px' }}>{errors.email}</p>
          )}
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          className="w-full text-white font-bold rounded-md"
          style={{ 
            height: '44px', 
            fontSize: '16px',
            backgroundColor: '#4A3CE1',
            border: 'none'
          }}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in to VoiceStack"
          )}
        </Button>
      </form>
    </div>
  );
}
