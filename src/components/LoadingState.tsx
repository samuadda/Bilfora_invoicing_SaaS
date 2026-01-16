import { Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  message = "جاري التحميل...",
  className,
  fullScreen = false
}: LoadingStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center w-full",
      fullScreen ? "fixed inset-0 z-50 bg-white/80 backdrop-blur-sm" : "min-h-[60vh]",
      className
    )}>
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full w-16 h-16" />
          <Loader2 className="h-14 w-14 text-brand-primary animate-spin relative z-10" strokeWidth={1.5} />
          <div className="absolute inset-0 border-4 border-brand-primary/10 rounded-full w-14 h-14" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-brand-dark font-bold text-lg">{message}</p>
          <p className="text-gray-400 text-sm">يرجى الانتظار قليلاً</p>
        </div>
      </m.div>
    </div>
  );
}

