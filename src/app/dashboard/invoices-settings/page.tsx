import { createClient } from "@/utils/supabase/server";
import { getInvoiceSettings } from "@/features/settings/data/settings.repo";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "إعدادات الفواتير | بيلفورة",
  description: "إدارة إعدادات الفواتير والضرائب",
};

export default async function InvoiceSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const settings = await getInvoiceSettings(supabase, user.id);

  return <SettingsClient initialSettings={settings} />;
}
