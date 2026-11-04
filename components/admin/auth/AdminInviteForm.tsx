"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { acceptInvite } from "@/lib/server/admin/auth";
import type { Invite } from "@/lib/server/admin/types";
import { PasswordInput as PasswordValues, passwordSchema } from "@/lib/validators/authSchema";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import SuccessCard from "@/components/admin/ui/SuccessCard";
import {
  FormField,
  PasswordInput,
  PillInput,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";

export default function AdminInviteForm({ invite }: { invite: Invite }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [termsError, setTermsError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: PasswordValues) {
    if (!agreed) {
      setTermsError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await acceptInvite({ token: invite.token, ...data });
      if (!result.success) {
        adminToast.add({ description: result.message, type: "error" });
        return;
      }
      setAccepted(true);
    } catch {
      adminToast.add({
        description: "Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (accepted) {
    return (
      <SuccessCard
        title="All set!"
        primary={{ label: "Go to Dashboard", href: "/dashboard" }}
      >
        Welcome aboard. Your profile is ready, and your access to manage{" "}
        {invite.organisation} has been activated. Let&apos;s get you into your
        workspace to begin verification.
      </SuccessCard>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-medium text-black md:text-4xl">
        Welcome to FuelTap
      </h1>
      <p className="text-grey-800 mt-2 text-base leading-snug">
        You&apos;re invited to join FuelTap as a{" "}
        <strong className="font-semibold text-black">{invite.role}</strong> at{" "}
        <strong className="font-semibold text-black">
          {invite.organisation}
        </strong>
        . This invitation is valid for{" "}
        <strong className="font-semibold text-black">7 days</strong>. Set your
        password to get started.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[clamp(1rem,4.5vh,2.5rem)] flex flex-col gap-4"
        noValidate
      >
        <FormField label="Email" htmlFor="email">
          <PillInput id="email" type="email" value={invite.email} disabled readOnly />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Enter your preferred password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        <div>
          <label className="flex cursor-pointer items-center gap-4 text-base text-black">
            {/* ! modifiers override the global `input` styles. */}
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setTermsError("");
              }}
              className="accent-primary-500 h-5! w-5! shrink-0 cursor-pointer rounded! p-0!"
            />
            <span>
              I agree to the{" "}
              <Link href="/support" className="text-primary-500 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/support" className="text-primary-500 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          {termsError && (
            <p role="alert" className="text-error mt-2 text-sm">
              {termsError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${primaryPillClass} mt-[clamp(0.75rem,3.5vh,2rem)]`}
        >
          {isSubmitting ? "Setting up…" : "Continue"}
        </button>
      </form>

      <p className="mt-6 text-center text-base text-black">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary-500 ml-2 text-lg font-medium hover:underline"
        >
          Login
        </Link>
      </p>
    </>
  );
}

export function InvalidInvite({ message }: { message: string }) {
  return (
    <>
      <h1 className="text-3xl font-medium text-black md:text-4xl">
        Invitation unavailable
      </h1>
      <p className="text-grey-800 mt-2 text-base leading-snug">
        {message} Ask your organisation&apos;s FuelTap contact to send you a new
        invitation.
      </p>
      <Link href="/login" className={`${primaryPillClass} mt-[clamp(1rem,4.5vh,2.5rem)]`}>
        Go to Log In
      </Link>
    </>
  );
}
