"use server";

import { createClient } from "@/utils/supabase/server";
import { upsertInvoiceSettings } from "@/features/settings/data/settings.repo";
import { InvoiceSettingsInput } from "@/features/settings/schemas/invoiceSettings.schema";
import { revalidatePath } from "next/cache";

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
	} catch (err) {
		console.error("Error updating settings:", err);
		const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
		return { success: false, error: `Failed to update settings: ${errorMessage}` };
	}
}
