import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import SoftGlow from "./SoftGlow";

type Action =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

interface Props {
  title: string;
  children: React.ReactNode;
  primary: Action;
  secondary?: Action;
}

// Full-page confirmation shown after a flow finishes (account created,
// password updated, KYB submitted, manager invited, station created).
export default function SuccessCard({
  title,
  children,
  primary,
  secondary,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 isolate overflow-y-auto bg-[#F8F9FB] px-4">
      <SoftGlow />
      <div
        role="status"
        className="mx-auto mt-16 flex w-full max-w-128 flex-col items-center rounded-[2rem] bg-white px-6 py-12 text-center shadow-xs md:mt-28 md:px-8"
      >
        <SuccessIcon />
        <h1 className="font-pjs mt-6 text-2xl font-semibold text-black md:text-3xl">
          {title}
        </h1>
        <div className="text-grey-800 mt-2 text-sm leading-snug md:text-base">
          {children}
        </div>
        <div className="mt-8 flex w-full max-w-97 flex-col gap-4">
          <ActionButton action={primary} variant="primary" />
          {secondary && <ActionButton action={secondary} variant="secondary" />}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  action,
  variant,
}: {
  action: Action;
  variant: "primary" | "secondary";
}) {
  const className = cn(
    buttonVariants({ size: "full" }),
    "h-14 rounded-full text-base",
    variant === "primary"
      ? "bg-primary-500 hover:bg-primary-500/90 text-white"
      : "border-primary-500 text-primary-500 hover:bg-primary-50 border bg-white",
  );

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

// Green check surrounded by small confetti shapes.
export function SuccessIcon() {
  const confetti = [
    "top-0 left-1/2 h-2 w-1 -translate-x-[150%] rotate-[-20deg]",
    "top-1 right-5 size-1.5 rounded-full",
    "top-4 left-2 size-2 rotate-45",
    "top-5 right-1 size-2 rotate-12",
    "top-1/2 left-0 h-1 w-2",
    "bottom-6 left-1 size-2 rotate-45",
    "bottom-4 right-0 h-2 w-1 rotate-[30deg]",
    "bottom-0 left-1/3 size-2 rounded-full",
    "bottom-1 right-1/3 h-2 w-1 rotate-[-30deg]",
  ];
  return (
    <div aria-hidden="true" className="relative size-26">
      {confetti.map((position) => (
        <span
          key={position}
          className={cn("absolute rounded-xs bg-[#BFF2DD]", position)}
        />
      ))}
      <span className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-green-500 text-white">
        <Check size={34} strokeWidth={3} />
      </span>
    </div>
  );
}
