import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Mail,
  ShieldUser,
} from "lucide-react";
import Link from "next/link";
import type { SetupStatus } from "@/lib/server/admin/types";

type Step = {
  key: string;
  title: string;
  text: string;
  done: boolean;
  icon: React.ReactNode;
  action?: { label: string; href: string };
};

// Steps unlock in order: each action is disabled until the step before it is done.
export default function AdminSetupChecklist({ setup }: { setup: SetupStatus }) {
  const steps: Step[] = [
    {
      key: "account",
      title: "Create Account",
      text: "Your account has been created",
      done: true,
      icon: <Mail />,
    },
    {
      key: "kyb",
      title: "Verify Your Business Identity (KYB)",
      text: "Enter your registration and tax details to verify your business.",
      done: setup.kybSubmitted,
      icon: <BriefcaseBusiness />,
      action: { label: "Complete KYB", href: "/kyb" },
    },
    {
      key: "manager",
      title: "Invite Your First Manager",
      text: "Fill in your manager's details and send them an invitation.",
      done: setup.hasManager,
      icon: <ShieldUser />,
      action: { label: "Create Invite", href: "/managers/invite" },
    },
    {
      key: "station",
      title: "Create First Station",
      text: "Set up a station and appoint a manager to oversee its operations.",
      done: setup.hasStation,
      icon: <Building2 />,
      action: { label: "Create First Station", href: "/stations/new" },
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const firstOpen = steps.findIndex((s) => !s.done);

  return (
    <section className="mt-10 max-w-158" aria-labelledby="setup-title">
      <h2 id="setup-title" className="text-xl font-medium text-black">
        Complete your account setup
      </h2>
      <p className="text-grey-800 mt-2 text-base">
        Finish these steps to activate your supplier account
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completed}
          aria-label="Setup progress"
          className="h-2 flex-1 overflow-hidden rounded-full bg-yellow-100"
        >
          <div
            className="h-full bg-[#FFC300] transition-[width] duration-500"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-grey-800 shrink-0 text-base">
          <span className="font-medium text-black">
            {completed}/{steps.length}
          </span>{" "}
          Completed
        </p>
      </div>

      <ol className="mt-6 flex flex-col gap-4">
        {steps.map((step, index) => {
          const enabled = index === firstOpen;
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center gap-4 rounded-2xl border px-5 py-4",
                step.done
                  ? "border-gray-100 bg-white/70"
                  : "border-transparent bg-green-50",
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white text-green-500 [&_svg]:size-6"
              >
                {step.icon}
              </span>
              <div
                className={cn(
                  "min-w-0 flex-1",
                  step.done && "text-grey-800 line-through",
                )}
              >
                <h3 className="text-xl leading-tight font-medium text-black">{step.title}</h3>
                <p className="text-grey-800 mt-1 text-base leading-snug">
                  {step.text}
                </p>
              </div>
              {step.done ? (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                  <Check size={20} aria-label="Completed" />
                </span>
              ) : step.action && enabled ? (
                <Link
                  href={step.action.href}
                  className="flex h-12 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium whitespace-nowrap text-black hover:bg-gray-100"
                >
                  {step.action.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              ) : step.action ? (
                <span
                  aria-disabled="true"
                  className="text-grey-600 flex h-12 shrink-0 cursor-not-allowed items-center gap-2 rounded-full bg-white/70 px-4 text-sm whitespace-nowrap"
                >
                  {step.action.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
