"use server";

import { createClient } from "@/utils/supabase/server";
import { upsertInvoiceSettings } from "@/features/settings/data/settings.repo";
import { InvoiceSettingsInput } from "@/features/settings/schemas/invoiceSettings.schema";
import { revalidatePath } from "next/cache";
import fs from "fs";

export async function updateSettingsAction(payload: InvoiceSettingsInput) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: "Unauthorized" };
		}

		await upsertInvoiceSettings(supabase, user.id, payload);
		revalidatePath("/dashboard/invoices-settings");
        // Also revalidate invoices since they use these settings
        revalidatePath("/dashboard/invoices"); 
		return { success: true };
	} catch (err: any) {
		console.error("Error updating settings:", err);
		try {
			fs.writeFileSync('error_log.json', JSON.stringify({
				error_object: err,
				message: err?.message,
				details: err?.details,
				stack: err?.stack,
				code: err?.code
			}, null, 2));
		} catch (e) {
			// ignore fs errors
		}
		let errorMessage = "Unknown error occurred";
		if (err instanceof Error && err.name === "ZodError" && Array.isArray((err as any).issues)) {
			// Extract just the message from the first Zod issue
			errorMessage = (err as any).issues.map((i: any) => i.message).join(', ');
		} else if (err?.message) {
			try {
				const parsed = JSON.parse(err.message);
				if (Array.isArray(parsed) && parsed[0]?.message) {
					errorMessage = parsed.map((i: any) => i.message).join(', ');
				} else {
					errorMessage = err.message;
				}
			} catch {
				errorMessage = err.message;
			}
		} else {
			errorMessage = err?.details || JSON.stringify(err);
		}
		
		return { success: false, error: errorMessage };
	}
}
