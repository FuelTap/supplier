import { z } from "zod";

export const corporateIdentitySchema = z.object({
  rcNumber: z
    .string({ message: "field cannot be empty." })
    .trim()
    .regex(/^(RC)?\s?\d{5,8}$/i, {
      message: "Enter a valid RC number, e.g. RC 1234567.",
    }),
  tin: z
    .string({ message: "field cannot be empty." })
    .trim()
    .regex(/^\d{8}-?\d{4}$/, {
      message: "Enter a valid TIN, e.g. 12345678-0001.",
    }),
});

export type CorporateIdentityInput = z.infer<typeof corporateIdentitySchema>;

export const KYB_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const KYB_ACCEPTED_TYPES = ["image/png", "image/jpeg"];

const kybFile = (label: string) =>
  z
    .file({ message: `${label} is required.` })
    .min(1, `${label} is empty.`)
    .max(KYB_MAX_FILE_SIZE, `${label} must be 5 MB or smaller.`)
    .mime(KYB_ACCEPTED_TYPES, `${label} must be a PNG or JPEG image.`);

export const corporateDocsSchema = z.object({
  companyLogo: kybFile("Company logo"),
  cacCertificate: kybFile("CAC certificate"),
  tinCertificate: kybFile("TIN certificate"),
});

export type CorporateDocsInput = z.infer<typeof corporateDocsSchema>;
