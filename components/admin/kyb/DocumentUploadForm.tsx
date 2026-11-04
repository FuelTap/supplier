"use client";

import { Camera, IdCard, Upload, X } from "lucide-react";
import { useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import {
  KYB_MAX_FILE_SIZE,
} from "@/lib/validators/kybAdminSchema";
import FocusedCard from "@/components/admin/ui/FocusedCard";
import {
  outlinePillClass,
  primaryPillClass,
} from "@/components/admin/ui/PillInput";

export type KybDocuments = {
  companyLogo: File | null;
  cacCertificate: File | null;
  tinCertificate: File | null;
};

const sections: {
  field: keyof KybDocuments;
  title: string;
  label: string;
  hint: string;
  icon: "upload" | "camera";
}[] = [
  {
    field: "companyLogo",
    title: "Company Logo",
    label: "Upload company logo asset",
    hint: "Supported formats include PNG, JPEG. Recommended dimensions: 500x500px",
    icon: "upload",
  },
  {
    field: "cacCertificate",
    title: "CAC Certificate",
    label: "Upload proof of CAC Registration",
    hint: "Supported formats include PNG, JPEG.",
    icon: "camera",
  },
  {
    field: "tinCertificate",
    title: "TIN Certificate",
    label: "Upload TIN Certificate",
    hint: "Supported formats include PNG, JPEG.",
    icon: "camera",
  },
];

interface Props {
  documents: KybDocuments;
  // Updates one document; applied to the latest state so quick successive
  // uploads don't overwrite each other.
  onFileChange: (field: keyof KybDocuments, file: File | null) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

// KYB step 2: logo plus CAC and TIN certificates.
export default function DocumentUploadForm({
  documents,
  onFileChange,
  isSubmitting,
  onCancel,
  onSubmit,
}: Props) {
  const complete = sections.every((s) => documents[s.field]);

  return (
    <FocusedCard
      title="Upload Corporate Documents & Branding"
      description="Please add your brand asset for customer visibility and upload your official incorporation certificates to finalize your compliance profile."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (complete) onSubmit();
        }}
      >
        <div className="mt-5 flex flex-col gap-5">
          {sections.map((section) => (
            <UploadSection
              key={section.field}
              {...section}
              file={documents[section.field]}
              disabled={isSubmitting}
              onFile={(file) => onFileChange(section.field, file)}
            />
          ))}
        </div>

        <div className="mt-14 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={outlinePillClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!complete || isSubmitting}
            className={primaryPillClass}
          >
            Submit for Verification
          </button>
        </div>
      </form>
    </FocusedCard>
  );
}

function UploadSection({
  title,
  label,
  hint,
  icon,
  file,
  disabled,
  onFile,
}: (typeof sections)[number] & {
  file: File | null;
  disabled: boolean;
  onFile: (file: File | null) => void;
}) {
  const [error, setError] = useState("");
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    multiple: false,
    maxSize: KYB_MAX_FILE_SIZE,
    disabled,
    onDrop: (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length) {
        setError("Choose one PNG or JPEG file, no larger than 5 MB.");
        return;
      }
      setError("");
      if (accepted[0]) onFile(accepted[0]);
    },
  });

  return (
    <section className="rounded-xl bg-gray-100 p-4">
      <h2 className="flex items-center gap-3 text-lg font-medium text-green-500">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-green-50"
        >
          <Camera size={20} />
        </span>
        {title}
      </h2>
      <p className="mt-4 text-base text-black">{label}</p>

      <div
        {...getRootProps({ "aria-label": `${label}. Click to upload` })}
        className="border-primary-400 mt-4 flex h-31 cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed text-center aria-disabled:cursor-not-allowed"
      >
        <input {...getInputProps()} />
        {icon === "upload" ? (
          <Upload className="text-black" size={30} aria-hidden="true" />
        ) : (
          <Camera className="text-neutra-600" size={30} aria-hidden="true" />
        )}
        <span className="text-primary-500 text-lg">
          {isDragActive ? "Drop the file here" : "Click to upload"}
        </span>
      </div>
      <p className="text-grey-800 mt-3 text-sm">{hint}</p>
      {error && (
        <p role="alert" className="text-error mt-2 text-sm">
          {error}
        </p>
      )}

      {file && (
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-500"
          >
            <IdCard size={22} />
          </span>
          <span className="min-w-0 flex-1 truncate text-base text-black">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onFile(null)}
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
            className="flex h-11 shrink-0 cursor-pointer items-center gap-3 rounded-full border border-gray-200 px-4 text-sm text-black hover:bg-gray-100"
          >
            Remove <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
