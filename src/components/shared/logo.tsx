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

function HeartKnotIcon({ size }: { size: number }) {
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
        <linearGradient id="heartGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="heartGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#7C4DFF" />
        </linearGradient>
      </defs>
      {/* Heart shape 1 (left-dominant) - stroked outline */}
      <path
        d="M22 40 C16 34 4 24 4 15 C4 8 9 4 15 4 C19 4 22 7 23 10 C23 7 26 5 30 5 C34 5 38 8 38 14 C38 18 35 22 30 27"
        stroke="url(#heartGrad1)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Heart shape 2 (right-dominant) - interlocking */}
      <path
        d="M26 40 C32 34 44 24 44 15 C44 8 39 4 33 4 C29 4 26 7 25 10 C25 7 22 5 18 5 C14 5 10 8 10 14 C10 18 13 22 18 27"
        stroke="url(#heartGrad2)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom meeting point */}
      <path
        d="M22 40 L24 42 L26 40"
        stroke="url(#heartGrad1)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ className, size = "md", variant = "full" }: LogoProps) {
  const config = sizeConfig[size];

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <HeartKnotIcon size={config.icon} />
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
        <span className="text-[#2563EB]">Event</span>
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
      <HeartKnotIcon size={config.icon} />
      <span className={cn("font-bold tracking-tight", config.text)}>
        <span className="text-[#2563EB]">Event</span>
        <span className="text-gray-900 dark:text-white">Swap</span>
      </span>
    </div>
  );
}
