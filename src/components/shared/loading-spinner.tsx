"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: { svg: 20, stroke: 2.5 },
  md: { svg: 36, stroke: 2.5 },
  lg: { svg: 52, stroke: 3 },
};

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
}: LoadingSpinnerProps) {
  const config = sizeMap[size];
  const center = config.svg / 2;
  const radius = center - config.stroke - 1;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <svg
        width={config.svg}
        height={config.svg}
        viewBox={`0 0 ${config.svg} ${config.svg}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
        style={{ animationDuration: "1s" }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-[#6C3CE1]/15"
        />
        {/* Spinning arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#spinnerGradient)"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.7} ${circumference * 0.3}`}
          className="origin-center"
        />
        {/* Gradient for the arc */}
        <defs>
          <linearGradient
            id="spinnerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#6C3CE1" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
