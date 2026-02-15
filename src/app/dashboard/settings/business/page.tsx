import { createClient } from "@/utils/supabase/server";
import { getInvoiceSettings } from "@/features/settings/data/settings.repo";
import { redirect } from "next/navigation";
import BusinessSettingsClient from "./BusinessSettingsClient";

export const metadata = {
	title: "بيانات المنشأة | الإعدادات | بيلفورة",
	description: "إدارة بيانات المنشأة والنشاط التجاري",
};

export default async function BusinessSettingsPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/auth/login");

	const settings = await getInvoiceSettings(supabase, user.id);
	return <BusinessSettingsClient initialSettings={settings} userId={user.id} />;
}
