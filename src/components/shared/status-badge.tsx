"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ListingStatus =
  | "active"
  | "sold"
  | "expired"
  | "cancelled"
  | "pending_review"
  | "draft";

type TransactionStatus =
  | "pending"
  | "awaiting_payment"
  | "payment_confirmed"
  | "transferring"
  | "completed"
  | "disputed"
  | "refunded"
  | "cancelled";

type Status = ListingStatus | TransactionStatus;

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  dotColor: string;
}

const statusMap: Record<Status, StatusConfig> = {
  // Listing statuses
  active: {
    label: "Active",
    variant: "success",
    dotColor: "bg-emerald-500",
  },
  sold: {
    label: "Sold",
    variant: "default",
    dotColor: "bg-[#6C3CE1]",
  },
  expired: {
    label: "Expired",
    variant: "secondary",
    dotColor: "bg-zinc-400",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    dotColor: "bg-red-500",
  },
  pending_review: {
    label: "Pending Review",
    variant: "warning",
    dotColor: "bg-amber-500",
  },
  draft: {
    label: "Draft",
    variant: "outline",
    dotColor: "bg-zinc-300",
  },

  // Transaction statuses
  pending: {
    label: "Pending",
    variant: "warning",
    dotColor: "bg-amber-500",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    variant: "warning",
    dotColor: "bg-amber-500",
  },
  payment_confirmed: {
    label: "Payment Confirmed",
    variant: "success",
    dotColor: "bg-emerald-500",
  },
  transferring: {
    label: "Transferring",
    variant: "default",
    dotColor: "bg-[#6C3CE1]",
  },
  completed: {
    label: "Completed",
    variant: "success",
    dotColor: "bg-emerald-500",
  },
  disputed: {
    label: "Disputed",
    variant: "destructive",
    dotColor: "bg-red-500",
  },
  refunded: {
    label: "Refunded",
    variant: "secondary",
    dotColor: "bg-zinc-400",
  },
};

interface StatusBadgeProps {
  status: Status;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = statusMap[status];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", config.dotColor)}
          aria-hidden="true"
        />
      )}
      {config.label}
    </Badge>
  );
}

export type { Status, ListingStatus, TransactionStatus };
