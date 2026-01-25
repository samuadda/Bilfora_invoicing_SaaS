import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { Card, Text, Heading } from "@/components/ui";

interface StatsCardProps {
    title: string;
    value: string | number | React.ReactNode;
    icon: LucideIcon;
    trend?: string;
    color: "purple" | "blue" | "green" | "orange" | "red" | "indigo";
    delay?: number;
    isWarning?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, color, delay = 0, isWarning }: StatsCardProps) {
    const colors = {
        purple: "bg-purple-50 text-brand-primary",
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
        red: "bg-red-50 text-red-600",
        indigo: "bg-indigo-50 text-indigo-600",
    };

    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            <Card
                hover
                className={cn(
                    "relative overflow-hidden group hover:-translate-y-1",
                    isWarning && "border-orange-200 bg-orange-50/30"
                )}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110" />

                <div className="flex justify-between items-start mb-6 relative">
                    <div className={cn("p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-105 duration-300", colors[color])}>
                        <Icon size={28} strokeWidth={2} />
                    </div>
                    {trend && (
                        <span className="flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-xl text-xs font-bold border border-green-100">
                            {trend}
                            <ArrowUpRight size={14} className="mr-1" />
                        </span>
                    )}
                </div>
                <div className="relative">
                    <Text variant="body-small" color="muted" className="mb-1 font-bold opacity-80">{title}</Text>
                    <Heading variant="h3" className="text-3xl font-extrabold tracking-tight">{value}</Heading>
                </div>
            </Card>
        </m.div>
    );
}

