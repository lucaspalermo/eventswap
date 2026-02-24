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
        <linearGradient id="iconHeartGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="iconHeartGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#7C4DFF" />
        </linearGradient>
      </defs>
      {/* Heart shape 1 (left-dominant) */}
      <path
        d="M22 40 C16 34 4 24 4 15 C4 8 9 4 15 4 C19 4 22 7 23 10 C23 7 26 5 30 5 C34 5 38 8 38 14 C38 18 35 22 30 27"
        stroke="url(#iconHeartGrad1)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Heart shape 2 (right-dominant) - interlocking */}
      <path
        d="M26 40 C32 34 44 24 44 15 C44 8 39 4 33 4 C29 4 26 7 25 10 C25 7 22 5 18 5 C14 5 10 8 10 14 C10 18 13 22 18 27"
        stroke="url(#iconHeartGrad2)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom meeting point */}
      <path
        d="M22 40 L24 42 L26 40"
        stroke="url(#iconHeartGrad1)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
