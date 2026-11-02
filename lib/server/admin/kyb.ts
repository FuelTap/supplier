"use server";

import {
  corporateDocsSchema,
  corporateIdentitySchema,
  type CorporateIdentityInput,
} from "@/lib/validators/kybAdminSchema";
import { getStore, wait } from "./mock";
import type { ActionResult } from "./types";

export async function submitCorporateIdentity(
  input: CorporateIdentityInput,
): Promise<ActionResult> {
  await wait();
  const parsed = corporateIdentitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }
  return { success: true, message: "Company information saved." };
}

export async function submitCorporateDocuments(
  body: FormData,
): Promise<ActionResult> {
  await wait(1500);
  const parsed = corporateDocsSchema.safeParse({
    companyLogo: body.get("companyLogo"),
    cacCertificate: body.get("cacCertificate"),
    tinCertificate: body.get("tinCertificate"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  getStore().kybSubmitted = true;
  return {
    success: true,
    message: "Your corporate information and assets have been uploaded.",
  };
}
