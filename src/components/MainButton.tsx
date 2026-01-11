import React from "react";
import { cn } from "@/lib/utils";

interface MainButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    bgColor?: string;
    hoverBgColor?: string;
    textColor?: string;
    shadowColor?: string;
    className?: string;
}

const MainButton: React.FC<MainButtonProps> = ({
    text = "هات العلم",
    rightIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-left-icon lucide-chevron-left transition-all duration-200 group-hover:-translate-x-1"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    ),
    bgColor = "bg-zinc-900",
    hoverBgColor = "hover:bg-brand-dark", // <-- Default hover color
    textColor = "text-amber-300",
    shadowColor = "rgba(251,191,36",
    className,
    ...props
}) => {
    return (
        <button
            className={cn("group relative px-5 py-1.5 rounded-4xl font-bold transition-all duration-100 ease-in-out active:translate-y-1", bgColor, hoverBgColor, textColor, className)}
            style={
                {
                    "--shadow": `${shadowColor},0.15)`,
                    "--shadow-deep": `${shadowColor},0.25)`,
                } as React.CSSProperties
            }
            {...props}
        >
            <span className="flex items-center gap-2 relative z-10">
                {text}
                {rightIcon}
            </span>
        </button>
    );
};

export default MainButton;
