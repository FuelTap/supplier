"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from "@/lib/server/admin/auth";
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

const OTP_SECONDS = 5 * 60 - 1; // the design starts the countdown at 04:59

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
});

type Step = "email" | "otp" | "reset" | "done";

function showError(message: string) {
  adminToast.add({ description: message, type: "error" });
}

export default function AdminForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  if (step === "done") {
    return (
      <SuccessCard
        title="Password updated."
        primary={{ label: "Okay", href: "/login" }}
      >
        Your password has been set successfully
      </SuccessCard>
    );
  }

  if (step === "otp") {
    return (
      <OtpStep
        email={email}
        onVerified={(code) => {
          setOtp(code);
          setStep("reset");
        }}
      />
    );
  }

  if (step === "reset") {
    return <ResetStep email={email} otp={otp} onDone={() => setStep("done")} />;
  }

  return (
    <EmailStep
      onSent={(value) => {
        setEmail(value);
        setStep("otp");
      }}
    />
  );
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
      const result = await requestPasswordResetOtp(email);
      if (!result.success) return showError(result.message);
      onSent(email);
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
        text="No problem! Just enter your email, and we'll send you a one-time password to verify your identity so you can reset your password."
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

function OtpStep({
  email,
  onVerified,
}: {
  email: string;
  onVerified: (otp: string) => void;
}) {
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  async function verify() {
    setIsSubmitting(true);
    try {
      const result = await verifyPasswordResetOtp({ email, otp: code });
      if (!result.success) return showError(result.message);
      onVerified(code);
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resend() {
    setIsResending(true);
    try {
      const result = await requestPasswordResetOtp(email);
      if (!result.success) return showError(result.message);
      adminToast.add({ description: result.message });
      setCode("");
      setSecondsLeft(OTP_SECONDS);
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <StepHeading
        title="Verify your email address"
        text="Enter the one-time code sent to your email"
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void verify();
        }}
        className="mt-[clamp(1.25rem,6vh,3.5rem)] flex flex-col items-center"
      >
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={code}
          onChange={setCode}
          aria-label="One-time code"
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="size-13 bg-white text-xl"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <p className="mt-6 flex items-center gap-2 text-base">
          <span className="text-black tabular-nums">
            {minutes}:{seconds}
          </span>
          <button
            type="button"
            onClick={() => void resend()}
            disabled={secondsLeft > 0 || isResending}
            className="text-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:text-primary-400/40"
          >
            {isResending ? "Resending…" : "Resend"}
          </button>
        </p>

        <button
          type="submit"
          disabled={code.length !== 6 || isSubmitting}
          className={`${primaryPillClass} mt-[clamp(1.25rem,6vh,3.5rem)]`}
        >
          {isSubmitting ? "Verifying…" : "Verify"}
        </button>
      </form>
      <BackToLogin />
    </>
  );
}

function ResetStep({
  email,
  otp,
  onDone,
}: {
  email: string;
  otp: string;
  onDone: () => void;
}) {
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
      const result = await resetPasswordWithOtp({ email, otp, ...data });
      if (!result.success) return showError(result.message);
      onDone();
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
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
