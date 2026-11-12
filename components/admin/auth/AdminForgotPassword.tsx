"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { requestPasswordReset, resetPassword } from "@/lib/server/admin/auth";
import {
  PasswordInput as PasswordValues,
  passwordSchema,
} from "@/lib/validators/authSchema";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import SuccessCard from "@/components/admin/ui/SuccessCard";
import {
  FormField,
  PasswordInput,
  PillInput,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";

const RESEND_SECONDS = 60;

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
});

function showError(message: string) {
  adminToast.add({ description: message, type: "error" });
}

// Step 1 of a password reset: email a reset link, which opens /reset-password.
export default function AdminForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) return <LinkSentStep email={sentTo} />;
  return <EmailStep onSent={setSentTo} />;
}

function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }: { email: string }) {
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.success) return showError(result.message);
      onSent(email.trim());
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <StepHeading
        title="Forgot your password?"
        text="No problem! Just enter your email, and we'll send you a link to reset your password."
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[clamp(1rem,4.5vh,2.5rem)] flex flex-col gap-4"
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
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${primaryPillClass} mt-[clamp(0.75rem,3.5vh,2rem)]`}
        >
          {isSubmitting ? "Sending…" : "Continue"}
        </button>
      </form>
      <p className="mt-6 text-center text-base text-black">
        Did you remember your password?{" "}
        <Link
          href="/login"
          className="text-primary-500 ml-1 font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}

function LinkSentStep({ email }: { email: string }) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function resend() {
    setIsResending(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.success) return showError(result.message);
      adminToast.add({ description: result.message });
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <StepHeading
        title="Check your email"
        text={`We've sent a password reset link to ${email}. Open it on this device to choose a new password.`}
      />
      <p className="mt-[clamp(1.25rem,6vh,3.5rem)] flex items-center justify-center gap-2 text-base">
        <span className="text-grey-800">Didn&apos;t get it?</span>
        <button
          type="button"
          onClick={() => void resend()}
          disabled={secondsLeft > 0 || isResending}
          className="text-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:text-primary-400/40"
        >
          {isResending
            ? "Resending…"
            : secondsLeft > 0
              ? `Resend in ${secondsLeft}s`
              : "Resend link"}
        </button>
      </p>
      <BackToLogin />
    </>
  );
}

// Step 2, opened from the emailed link: /reset-password?email=…&token=…
export function ResetPasswordForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: PasswordValues) {
    setIsSubmitting(true);
    try {
      const result = await resetPassword({ email, token, ...data });
      if (!result.success) return showError(result.message);
      setDone(true);
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <SuccessCard
        title="Password updated."
        primary={{ label: "Okay", href: "/login" }}
      >
        Your password has been set successfully
      </SuccessCard>
    );
  }

  return (
    <>
      <StepHeading
        title="Reset your password"
        text="Create a new password to access your account"
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[clamp(1.25rem,6vh,3.5rem)] flex flex-col gap-4"
        noValidate
      >
        <FormField
          label="New Password"
          htmlFor="password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Enter a new password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>
        <FormField
          label="Confirm New Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm the new password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${primaryPillClass} mt-[clamp(1.25rem,5vh,3rem)]`}
        >
          {isSubmitting ? "Saving…" : "Continue"}
        </button>
      </form>
      <p className="mt-6 text-center text-base text-black">
        Link expired?{" "}
        <Link
          href="/forgot-password"
          className="text-primary-500 ml-1 font-medium hover:underline"
        >
          Request a new one
        </Link>
      </p>
    </>
  );
}

export function InvalidResetLink() {
  return (
    <>
      <StepHeading
        title="Reset link unavailable"
        text="This password reset link is incomplete. Request a new link and open it straight from the email."
      />
      <Link
        href="/forgot-password"
        className={`${primaryPillClass} mt-[clamp(1rem,4.5vh,2.5rem)]`}
      >
        Request a New Link
      </Link>
      <BackToLogin />
    </>
  );
}

function StepHeading({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h1 className="text-3xl font-medium text-black md:text-4xl">{title}</h1>
      <p className="text-grey-800 mt-2 text-base leading-snug">{text}</p>
    </>
  );
}

function BackToLogin() {
  return (
    <Link
      href="/login"
      className="text-primary-500 mt-6 block text-center text-lg font-medium hover:underline"
    >
      Back to Log In
    </Link>
  );
}
