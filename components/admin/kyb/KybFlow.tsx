"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  submitCorporateDocuments,
  submitCorporateIdentity,
} from "@/lib/server/admin/kyb";
import type { CorporateIdentityInput } from "@/lib/validators/kybAdminSchema";
import { adminToast } from "@/components/admin/ui/AdminToaster";
import FocusedHeader from "@/components/admin/ui/FocusedHeader";
import ProcessingOverlay from "@/components/admin/ui/ProcessingOverlay";
import SuccessCard from "@/components/admin/ui/SuccessCard";
import CorporateIdentityForm from "./CorporateIdentityForm";
import DocumentUploadForm, { type KybDocuments } from "./DocumentUploadForm";

type Step = "identity" | "documents" | "submitted";

function showError(message: string) {
  adminToast.add({ description: message, type: "error" });
}

export default function KybFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identity");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identity, setIdentity] = useState<CorporateIdentityInput>({
    rcNumber: "",
    tin: "",
  });
  const [documents, setDocuments] = useState<KybDocuments>({
    companyLogo: null,
    cacCertificate: null,
    tinCertificate: null,
  });

  const exit = () => router.push("/dashboard");

  async function saveIdentity(values: CorporateIdentityInput) {
    setIsSubmitting(true);
    try {
      const result = await submitCorporateIdentity(values);
      if (!result.success) return showError(result.message);
      setIdentity(values);
      setStep("documents");
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitDocuments() {
    const body = new FormData();
    for (const [key, file] of Object.entries(documents)) {
      if (file) body.append(key, file);
    }
    setIsSubmitting(true);
    try {
      const result = await submitCorporateDocuments(body);
      if (!result.success) return showError(result.message);
      setStep("submitted");
    } catch {
      showError("Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "submitted") {
    return (
      <SuccessCard
        title="Corporate Setup Submitted"
        primary={{ label: "Go to Dashboard", href: "/dashboard" }}
      >
        Your corporate information and assets have been uploaded successfully.
      </SuccessCard>
    );
  }

  return (
    <>
      <FocusedHeader
        progress={step === "identity" ? 50 : 100}
        action="cancel"
        onAction={exit}
      />
      {step === "identity" ? (
        <CorporateIdentityForm
          defaultValues={identity}
          isSubmitting={isSubmitting}
          onCancel={exit}
          onSubmit={saveIdentity}
        />
      ) : (
        <DocumentUploadForm
          documents={documents}
          onFileChange={(field, file) =>
            setDocuments((prev) => ({ ...prev, [field]: file }))
          }
          isSubmitting={isSubmitting}
          onCancel={exit}
          onSubmit={submitDocuments}
        />
      )}
      {isSubmitting && step === "documents" && <ProcessingOverlay />}
    </>
  );
}
