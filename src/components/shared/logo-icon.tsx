import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className, size = 32 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="EventSwap"
    >
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6C3CE1" />
          <stop offset="100%" stopColor="#5322C0" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="24" cy="24" r="23" fill="url(#iconGrad)" />
      {/* Inner glow ring */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.75"
      />
      {/* Arrow 1: Curving from top-right to bottom-left */}
      <path
        d="M30 13C30 13 36 18 36 24C36 30 30 35 24 35"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrowhead 1 */}
      <path
        d="M27 32L24 35L27 38"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow 2: Curving from bottom-left to top-right */}
      <path
        d="M18 35C18 35 12 30 12 24C12 18 18 13 24 13"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrowhead 2 */}
      <path
        d="M21 16L24 13L21 10"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center dot accent */}
      <circle cx="24" cy="24" r="2.5" fill="white" opacity="0.9" />
    </svg>
  );
}
