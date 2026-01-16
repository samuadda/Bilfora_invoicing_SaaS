"use client";

import { m, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface SidebarTooltipProps {
    isCollapsed: boolean;
    hoveredItem: { label: string; top: number } | null;
    mounted: boolean;
}

export function SidebarTooltip({
    isCollapsed,
    hoveredItem,
    mounted
}: SidebarTooltipProps) {
    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isCollapsed && hoveredItem && (
                <m.div
                    initial={{ opacity: 0, x: 10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 5, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                        top: hoveredItem.top,
                        position: "fixed",
                        right: "96px", // Sidebar (80) + Gap (16)
                        transform: "translateY(-50%)",
                        zIndex: 9999,
                    }}
                    className="pointer-events-none flex items-center"
                >
                    <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg shadow-xl whitespace-nowrap relative">
                        {hoveredItem.label}
                        {/* Right pointing triangle (points to sidebar) */}
                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900/95"></div>
                    </div>
                </m.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
