import { createClient } from "@/utils/supabase/server";
import { getInvoiceSettings } from "@/features/settings/data/settings.repo";
import { redirect } from "next/navigation";
import InvoicingSettingsClient from "./InvoicingSettingsClient";

export const metadata = {
	title: "إعدادات الفواتير | الإعدادات | بيلفورة",
	description: "إعدادات الترقيم والضرائب وبيانات الدفع",
};

export default async function InvoicingSettingsPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/auth/login");

	const settings = await getInvoiceSettings(supabase, user.id);
	return <InvoicingSettingsClient initialSettings={settings} />;
}
