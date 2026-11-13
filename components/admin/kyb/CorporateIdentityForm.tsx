"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  corporateIdentitySchema,
  type CorporateIdentityInput,
} from "@/lib/validators/kybAdminSchema";
import FocusedCard from "@/components/admin/ui/FocusedCard";
import {
  FormField,
  PillInput,
  outlinePillClass,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";

interface Props {
  defaultValues: CorporateIdentityInput;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CorporateIdentityInput) => void;
}

// KYB step 1: company registration and tax numbers.
export default function CorporateIdentityForm({
  defaultValues,
  isSubmitting,
  onCancel,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CorporateIdentityInput>({
    resolver: zodResolver(corporateIdentitySchema),
    defaultValues,
    mode: "onChange",
  });

  return (
    <FocusedCard
      title="Verify Your Corporate Identity"
      description="Enter your company registration and tax details. We use these to automatically verify your business legal status with the Corporate Affairs Commission (CAC) and FIRS."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className="mt-6 flex items-center gap-3 text-lg font-medium text-green-500">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full bg-green-50"
          >
            <FileText size={20} />
          </span>
          Company Information
        </h2>

        <div className="mt-5 flex flex-col gap-4 rounded-xl bg-gray-100 p-4">
          <FormField
            label="CAC RC Number"
            htmlFor="rcNumber"
            error={errors.rcNumber?.message}
          >
            <PillInput
              id="rcNumber"
              placeholder="Enter your RC number e.g., RC 1234567"
              aria-invalid={!!errors.rcNumber}
              {...register("rcNumber")}
            />
          </FormField>
          <FormField
            label="Corporate Tax Identification Number (TIN)"
            htmlFor="tin"
            error={errors.tin?.message}
          >
            <PillInput
              id="tin"
              placeholder="Enter your Tax ID number e.g., 12345678-0001"
              aria-invalid={!!errors.tin}
              {...register("tin")}
            />
          </FormField>
        </div>

        <div className="mt-14 flex gap-4">
          <button type="button" onClick={onCancel} className={outlinePillClass}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={primaryPillClass}
          >
            {isSubmitting ? "Saving…" : "Next"}
          </button>
        </div>
      </form>
    </FocusedCard>
  );
}
