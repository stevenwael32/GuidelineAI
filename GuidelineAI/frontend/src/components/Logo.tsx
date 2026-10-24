import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="gmark" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38E1FF" />
          <stop offset="100%" stopColor="#4C8DFF" />
        </linearGradient>
      </defs>
      <path
        d="M27 12.5A11 11 0 1 0 30.5 22H21"
        stroke="url(#gmark)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="21" cy="22" r="2" fill="#2DD9C4" />
      <circle cx="30.5" cy="22" r="1.6" fill="#38E1FF" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Guideline<span className="text-gradient-evidence">AI</span>
      </span>
    </div>
  );
}
