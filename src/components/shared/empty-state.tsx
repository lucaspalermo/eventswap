"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2563EB]/10"
      >
        <Icon className="h-10 w-10 text-[#2563EB]" strokeWidth={1.5} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400"
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#2563EB]/25 transition-colors hover:bg-[#5B32BF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-2"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
