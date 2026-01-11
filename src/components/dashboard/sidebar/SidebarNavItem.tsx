"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { colors } from "@/lib/ui/tokens";

interface SidebarNavItemProps {
    href: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    isCollapsed: boolean;
    onClick?: () => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave?: () => void;
}

export function SidebarNavItem({
    href,
    label,
    icon: Icon,
    active,
    isCollapsed,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: SidebarNavItemProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                active
                    ? `bg-gradient-to-l from-[${colors.brand.primary}]/10 to-transparent text-[${colors.brand.primary}]`
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
        >
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className={`absolute right-0 top-0 bottom-0 w-1 bg-[${colors.brand.primary}] rounded-l-full`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
            <div className={cn("relative z-10 transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")}>
                <Icon size={isCollapsed ? 24 : 20} strokeWidth={active ? 2.5 : 2} />
            </div>

            {!isCollapsed && (
                <span className="z-10">{label}</span>
            )}
        </Link>
    );
}
