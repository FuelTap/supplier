"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogin } from "@/lib/server/admin/auth";
import { LoginInput, loginSchema } from "@/lib/validators/authSchema";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import {
  FormField,
  PasswordInput,
  PillInput,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";

export default function AdminLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setIsSubmitting(true);
    try {
      const response = await adminLogin(data);
      if (!response.success) {
        adminToast.add({
          title: "Login failed",
          description: response.message,
          type: "error",
        });
        return;
      }
      router.replace("/dashboard");
    } catch {
      adminToast.add({
        title: "Login failed",
        description: "Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-medium text-black md:text-4xl">
        Welcome Back!
      </h1>
      <p className="text-grey-800 mt-2 text-base">
        Glad to see you again! Please log in to continue.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[clamp(1.25rem,6vh,3.5rem)] flex flex-col gap-4"
        noValidate
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <PillInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <Link
          href="/forgot-password"
          className="text-primary-500 self-end text-sm hover:underline"
        >
          Forgot Password?
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${primaryPillClass} mt-[clamp(1.25rem,5vh,3rem)]`}
        >
          {isSubmitting ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-base text-black">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary-500 ml-2 text-lg font-medium hover:underline"
        >
          Create Account
        </Link>
      </p>
    </>
  );
}
