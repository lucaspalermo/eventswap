"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon" | "text";
}

const sizeConfig = {
  sm: { icon: 24, text: "text-lg", gap: "gap-1.5" },
  md: { icon: 32, text: "text-xl", gap: "gap-2" },
  lg: { icon: 44, text: "text-3xl", gap: "gap-3" },
};

function SwapIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6C3CE1" />
          <stop offset="100%" stopColor="#5322C0" />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#7C4DFF" />
          <stop offset="100%" stopColor="#6C3CE1" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="24" cy="24" r="23" fill="url(#logoGrad1)" />
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

export function Logo({ className, size = "md", variant = "full" }: LogoProps) {
  const config = sizeConfig[size];

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <SwapIcon size={config.icon} />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span
        className={cn(
          "font-bold tracking-tight",
          config.text,
          className
        )}
      >
        <span className="text-[#6C3CE1]">Event</span>
        <span className="text-gray-900 dark:text-white">Swap</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center",
        config.gap,
        className
      )}
    >
      <SwapIcon size={config.icon} />
      <span className={cn("font-bold tracking-tight", config.text)}>
        <span className="text-[#6C3CE1]">Event</span>
        <span className="text-gray-900 dark:text-white">Swap</span>
      </span>
    </div>
  );
}
