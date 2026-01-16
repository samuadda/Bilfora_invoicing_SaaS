"use client";

import { toast as sonnerToast } from "sonner";
import { useCallback } from "react";

export function useToast() {
	// Function reference must be stable to prevent infinite loops in useEffects
	// that depend on toast (like in products/page.tsx)
	const toast = useCallback((options: {
		title?: string;
		description?: string;
		variant?: "default" | "destructive";
	}) => {
		if (options.variant === "destructive") {
			sonnerToast.error(options.title || "Error", {
				description: options.description,
			});
		} else {
			sonnerToast.success(options.title || "Success", {
				description: options.description,
			});
		}
	}, []);

	return { toast };
}
