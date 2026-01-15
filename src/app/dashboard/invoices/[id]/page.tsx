import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import InvoiceDetailClient from "./InvoiceDetailClient";
import { getInvoiceSettings } from "@/features/settings/data/settings.repo";
import type { Client, InvoiceItem, InvoiceWithClientAndItems } from "@/types/database";
import type { InvoiceSettings } from "@/features/settings/schemas/invoiceSettings.schema";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: Props) {
	const { id } = await params;
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		notFound();
	}

	const { data: invoiceData, error } = await supabase
		.from("invoices")
		.select(
			`
            *,
            client:clients(*),
            items:invoice_items(*),
            payments:payments(*)
      `,
		)
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (error || !invoiceData) {
		notFound();
	}

	// Cast to the expected structure with nullable client
	const invoiceBase = invoiceData as unknown as InvoiceWithClientAndItems;
	const clientData = (invoiceData as unknown as { client?: Client | null }).client ?? null;
	const itemsData = (invoiceData as unknown as { items?: InvoiceItem[] }).items ?? [];

	const invoice = {
		...invoiceBase,
		client: clientData,
		items: itemsData,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		payments: ((invoiceData as unknown as { payments: any[] }).payments ?? []),
	};

	const invoiceSettings: InvoiceSettings | null = await getInvoiceSettings(supabase, user.id);

	const isSettingsReady =
		Boolean(invoiceSettings?.seller_name) &&
		Boolean(invoiceSettings?.vat_number);

	return (
		<InvoiceDetailClient
			invoice={invoice}
			client={invoice.client}
			items={invoice.items}
			payments={invoice.payments}
			invoiceSettings={invoiceSettings}
			isSettingsReady={isSettingsReady}
		/>
	);
}
