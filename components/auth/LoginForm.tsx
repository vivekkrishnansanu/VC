"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

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

  const validateField = (field: keyof LoginFormData, value: string) => {
    try {
      loginSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0]?.message }));
      }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Full name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          autoComplete="name"
          aria-invalid={touched.name && errors.name ? "true" : "false"}
          aria-describedby={touched.name && errors.name ? "name-error" : undefined}
          className={touched.name && errors.name ? "border-destructive" : ""}
        />
        {touched.name && errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Work Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Work email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          autoComplete="email"
          inputMode="email"
          aria-invalid={touched.email && errors.email ? "true" : "false"}
          aria-describedby={touched.email && errors.email ? "email-error" : undefined}
          className={touched.email && errors.email ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground">
          For demo: emails containing <span className="font-medium text-foreground">@company.com</span> or{" "}
          <span className="font-medium text-foreground">implementation</span> sign in as an Implementation Lead.
        </p>
        {touched.email && errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      {/* Primary CTA */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  );
}

