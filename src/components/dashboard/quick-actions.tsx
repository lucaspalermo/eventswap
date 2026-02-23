"use client";

import { motion } from "framer-motion";
import { Plus, Store, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  bgColor: string;
  hoverBgColor: string;
}

const actions: QuickAction[] = [
  {
    label: "Criar Anuncio",
    href: "/sell",
    icon: Plus,
    bgColor: "bg-[#6C3CE1]",
    hoverBgColor: "hover:bg-[#5B32C1]",
  },
  {
    label: "Ver Marketplace",
    href: "/marketplace",
    icon: Store,
    bgColor: "bg-blue-600",
    hoverBgColor: "hover:bg-blue-700",
  },
  {
    label: "Minhas Mensagens",
    href: "/chat",
    icon: MessageSquare,
    bgColor: "bg-emerald-600",
    hoverBgColor: "hover:bg-emerald-700",
  },
  {
    label: "Configuracoes",
    href: "/settings",
    icon: Settings,
    bgColor: "bg-zinc-600",
    hoverBgColor: "hover:bg-zinc-700",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Acoes Rapidas</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.label} variants={itemVariants}>
                <Link
                  href={action.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-lg p-4 text-white shadow-sm transition-all duration-200",
                    "hover:shadow-md hover:-translate-y-0.5",
                    "active:translate-y-0 active:shadow-sm",
                    action.bgColor,
                    action.hoverBgColor
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}
