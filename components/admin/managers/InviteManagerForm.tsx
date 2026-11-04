"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { inviteManager } from "@/lib/server/admin/managers";
import { managerSchema, type ManagerInput } from "@/lib/validators/adminSchemas";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import FocusedCard from "@/components/admin/ui/FocusedCard";
import FocusedHeader from "@/components/admin/ui/FocusedHeader";
import {
  FormField,
  PillInput,
  outlinePillClass,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";
import SuccessCard from "@/components/admin/ui/SuccessCard";

const emptyForm: ManagerInput = { name: "", email: "", phone: "" };

export default function InviteManagerForm() {
  const router = useRouter();
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ManagerInput>({
    resolver: zodResolver(managerSchema),
    defaultValues: emptyForm,
    mode: "onChange",
  });

  async function onSubmit(values: ManagerInput) {
    setIsSubmitting(true);
    try {
      const result = await inviteManager(values);
      if (!result.success) {
        adminToast.add({ description: result.message, type: "error" });
        return;
      }
      setInvitedEmail(result.message);
    } catch {
      adminToast.add({
        description: "Please check your connection and try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (invitedEmail) {
    return (
      <SuccessCard
        title="Invitation Sent Successfully"
        primary={{ label: "Go to Dashboard", href: "/dashboard" }}
        secondary={{
          label: "Invite Another",
          onClick: () => {
            reset(emptyForm);
            setInvitedEmail(null);
          },
        }}
      >
        An onboarding link has been dispatched to{" "}
        <strong className="font-semibold text-black">{invitedEmail}</strong>.
        They will appear on your team dashboard as Pending Invite.
      </SuccessCard>
    );
  }

  return (
    <>
      <FocusedHeader progress={100} action="back" onAction={() => router.back()} />
      <FocusedCard
        title="Invite Manager"
        description="Provide the legal contact details of your branch or cluster manager. They will receive an invitation link to verify their identity and manage their assigned stations."
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          <FormField label="Full Name" htmlFor="name" error={errors.name?.message}>
            <PillInput
              id="name"
              autoComplete="name"
              placeholder="Enter full name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </FormField>
          <FormField
            label="Official Email Address"
            htmlFor="email"
            error={errors.email?.message}
          >
            <PillInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter email address"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </FormField>
          <FormField label="Phone Number" htmlFor="phone" error={errors.phone?.message}>
            <div className="flex h-12.5 overflow-hidden rounded-full border border-gray-200 bg-white focus-within:ring-4 focus-within:ring-primary-50">
              <span className="text-primary-400 flex shrink-0 items-center gap-3 bg-gray-100 px-5 text-base">
                NGN <ChevronDown size={18} aria-hidden="true" />
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="e.g. 7034567890"
                aria-invalid={!!errors.phone}
                {...register("phone", {
                  setValueAs: (v: string) => v.replace(/\D/g, ""),
                })}
                className="h-full! min-w-0 flex-1 rounded-none! border-0! bg-transparent! px-3! text-base! text-black! outline-none placeholder:text-grey-800!"
              />
            </div>
          </FormField>

          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/managers")}
              className={outlinePillClass}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={primaryPillClass}
            >
              {isSubmitting ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      </FocusedCard>
    </>
  );
}
