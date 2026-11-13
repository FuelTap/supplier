"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogin } from "@/lib/server/admin/auth";
import {
  type LoginAccountType,
  LoginInput,
  loginSchema,
} from "@/lib/validators/authSchema";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import {
  FormField,
  PasswordInput,
  PillInput,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";

export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState<LoginAccountType>("supplier");
  const accountLabel =
    accountType === "supplier" ? "Supplier" : "Station manager";
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
      const response = await adminLogin(data, accountType);
      if (!response.success) {
        adminToast.add({
          title: "Login failed",
          description: response.message,
          type: "error",
        });
        return;
      }
      router.replace(response.redirectTo);
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
        {accountLabel} login
      </h1>
      <p className="text-grey-800 mt-2 text-base">
        {accountType === "supplier"
          ? "Sign in to manage your stations and supplier account."
          : "Sign in with your assigned station manager account."}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[clamp(1.25rem,6vh,3.5rem)] flex flex-col gap-4"
        noValidate
      >
        <fieldset disabled={isSubmitting} className="mb-2 min-w-0">
          <legend className="mb-3 text-base text-black">Sign in as</legend>
          <div className="grid grid-cols-2 gap-1 rounded-full border border-gray-200 bg-gray-50 p-1">
            {(
              [
                ["supplier", "Supplier"],
                ["manager", "Station manager"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="relative min-w-0 cursor-pointer">
                <input
                  type="radio"
                  name="accountType"
                  value={value}
                  checked={accountType === value}
                  onChange={() => setAccountType(value)}
                  className="peer sr-only"
                />
                <span
                  className={`flex min-h-11 items-center justify-center rounded-full px-3 py-2 text-center text-sm font-medium text-gray-600 peer-checked:bg-primary-500 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-60`}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
          {isSubmitting
            ? "Logging in…"
            : `Log in as ${accountLabel.toLowerCase()}`}
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
