"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { UserRole } from "@/types";
import { Loader2, Mail, User, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});
  const [focusedField, setFocusedField] = useState<keyof LoginFormData | null>(null);

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
    setFocusedField(null);
  };

  const handleFocus = (field: keyof LoginFormData) => {
    setFocusedField(field);
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
    setTouched({ name: true, email: true });

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
      const role =
        result.data.email.includes("@company.com") ||
        result.data.email.includes("implementation")
          ? UserRole.IMPLEMENTATION_LEAD
          : UserRole.CUSTOMER;

      await signIn({
        id: `user-${Date.now()}`,
        name: result.data.name,
        email: result.data.email,
        role,
      });
    } catch (error) {
      console.error("Login error:", error);
      // Error handling can be enhanced with toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid by validating the schema
  const validationResult = loginSchema.safeParse(formData);
  const isFormValid = validationResult.success && !isSubmitting;

  const isFieldValid = (field: keyof LoginFormData) => {
    return touched[field] && !errors[field] && formData[field].length > 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name Field */}
      <div className="space-y-2.5">
        <Label 
          htmlFor="name" 
          className="text-sm font-semibold text-foreground flex items-center gap-2"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          Full name
        </Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            onFocus={() => handleFocus("name")}
            autoComplete="name"
            aria-invalid={touched.name && errors.name ? "true" : "false"}
            aria-describedby={touched.name && errors.name ? "name-error" : undefined}
            className={cn(
              "h-12 transition-all duration-200",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              touched.name && errors.name && "border-destructive focus:border-destructive focus:ring-destructive/20",
              isFieldValid("name") && "border-green-500/50 focus:border-green-500 focus:ring-green-500/20",
              focusedField === "name" && "shadow-lg shadow-primary/5"
            )}
          />
          {isFieldValid("name") && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {touched.name && errors.name && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        {touched.name && errors.name && (
          <p 
            id="name-error" 
            className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1" 
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Work Email Field */}
      <div className="space-y-2.5">
        <Label 
          htmlFor="email" 
          className="text-sm font-semibold text-foreground flex items-center gap-2"
        >
          <Mail className="h-4 w-4 text-muted-foreground" />
          Work email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="john.doe@company.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            onFocus={() => handleFocus("email")}
            autoComplete="email"
            inputMode="email"
            aria-invalid={touched.email && errors.email ? "true" : "false"}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
            className={cn(
              "h-12 transition-all duration-200",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              touched.email && errors.email && "border-destructive focus:border-destructive focus:ring-destructive/20",
              isFieldValid("email") && "border-green-500/50 focus:border-green-500 focus:ring-green-500/20",
              focusedField === "email" && "shadow-lg shadow-primary/5"
            )}
          />
          {isFieldValid("email") && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {touched.email && errors.email && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>
        <div className="rounded-lg bg-muted/50 p-3 border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Demo mode:</span> Emails containing{" "}
            <span className="font-medium text-primary">@company.com</span> or{" "}
            <span className="font-medium text-primary">implementation</span> will sign in as an{" "}
            <span className="font-medium text-foreground">Implementation Lead</span>.
          </p>
        </div>
        {touched.email && errors.email && (
          <p 
            id="email-error" 
            className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1" 
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Primary CTA Button */}
      <div 
        className="text-center grid flex-wrap"
        style={{
          paddingTop: '2px',
          paddingBottom: '2px',
          backgroundColor: 'rgba(74, 60, 225, 1)',
          color: 'rgba(255, 255, 255, 1)',
          borderRadius: '4px',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          borderBottomRightRadius: '4px',
          borderBottomLeftRadius: '4px'
        }}
      >
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold text-white rounded-[4px]"
          style={{ 
            backgroundColor: 'rgba(74, 60, 225, 1)'
          }}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
    </form>
  );
}

