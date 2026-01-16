"use client";

import { useState, useEffect, useCallback } from "react";
// import { z } from "zod"; // Unused
import { useToast } from "@/components/ui/use-toast";
import {
	Loader2,
	AlertCircle,
	X,
	User,
	FileText,
} from "lucide-react";
import { invoiceSchema } from "@/lib/schemas/invoice";
// import { supabase } from "@/lib/supabase"; // DB logic moved to server action
import { createInvoiceAction } from "@/actions/invoices";
import { useQueryClient } from "@tanstack/react-query";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import type {
	Client,
	CreateInvoiceInput,
	CreateInvoiceItemInput,
} from "@/types/database";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
	Heading,
	Text,
	Button,
} from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import { formatCurrency } from "@/lib/formatters";
import { InvoiceClientSection } from "@/components/invoice/InvoiceClientSection";
import { InvoiceDetailsForm } from "@/components/invoice/InvoiceDetailsForm";
import { InvoiceItemsTable } from "@/components/invoice/InvoiceItemsTable";
import { InvoiceSummary } from "@/components/invoice/InvoiceSummary";

interface InvoiceCreationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: (id?: string) => void;
}



export default function InvoiceCreationModal({
	isOpen,
	onClose,
	onSuccess,
}: InvoiceCreationModalProps) {
	// Validation schemas moved to @/lib/schemas/invoice.ts
	// Keeping local references if needed or just using imported ones.



	// Modal state
	const queryClient = useQueryClient();
	const { data: clients = [] } = useClients();
	const { data: products = [] } = useProducts();
	// const [clients, setClients] = useState<Client[]>([]); // Replaced by hook
	// const [products, setProducts] = useState<Product[]>([]); // Replaced by hook
	const [saving, setSaving] = useState(false);
	const [invoiceFormData, setInvoiceFormData] = useState<CreateInvoiceInput>({
		client_id: "",
		order_id: null,
		invoice_type: "standard_tax",
		document_kind: "invoice",
		issue_date: new Date().toISOString().split("T")[0],
		due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
		status: "draft",
		tax_rate: 15,
		notes: "",
		items: [{ description: "", quantity: 1, unit_price: 0 }],
	});

	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	const closeModal = useCallback(() => {
		resetInvoiceForm();
		onClose();
	}, [onClose]);

	// Load data when modal opens -> Handled by TanStack Query automatically
	/* useEffect(() => {
		if (isOpen) {
			loadClientsForInvoice();
			loadProducts();
		}
	}, [isOpen]); */

	// Handle ESC key and backdrop click
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeModal();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, closeModal]);

	// Manual loading functions removed in favor of hooks

	const handleInvoiceInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;

		setInvoiceFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleInvoiceItemChange = (
		index: number,
		field: keyof CreateInvoiceItemInput,
		value: string | number,
	) => {
		setInvoiceFormData((prev) => ({
			...prev,
			items: prev.items.map((item, i) =>
				i === index ? { ...item, [field]: value } : item,
			),
		}));
	};

	const addInvoiceItem = () => {
		setInvoiceFormData((prev) => ({
			...prev,
			items: [
				...prev.items,
				{
					description: "",
					quantity: 1,
					unit_price: 0,
				},
			],
		}));
	};

	const removeInvoiceItem = (index: number) => {
		if (invoiceFormData.items.length > 1) {
			setInvoiceFormData((prev) => ({
				...prev,
				items: prev.items.filter((_, i) => i !== index),
			}));
		}
	};

	const resetInvoiceForm = () => {
		setInvoiceFormData({
			client_id: "",
			order_id: "",
			invoice_type: "standard_tax",
			document_kind: "invoice",
			issue_date: new Date().toISOString().split("T")[0],
			due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0],
			status: "draft",
			tax_rate: 15,
			notes: "",
			items: [
				{
					description: "",
					quantity: 1,
					unit_price: 0,
				},
			],
		});
		setError(null);
	};

	const handleInvoiceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (saving) return;

		try {
			setSaving(true);
			setError(null);

			// Client-Side Validation (Fast Feedback)
			const parsed = invoiceSchema.safeParse(invoiceFormData);
			if (!parsed.success) {
				const msg = parsed.error.issues[0]?.message || "البيانات غير صالحة";
				toast({
					title: "تحقق من المدخلات",
					description: msg,
					variant: "destructive",
				});
				return;
			}

			// Call Server Action
			const result = await createInvoiceAction(parsed.data);

			if (!result.success || !result.data) {
				const msg = result.error || "خطأ غير معروف في الخادم";
				toast({
					title: "فشل الإنشاء",
					description: msg,
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "تم إنشاء الفاتورة",
				description: result.data.invoice_number
					? `تم إنشاء الفاتورة بنجاح (${result.data.invoice_number})`
					: "تم إنشاء الفاتورة بنجاح",
			});

			closeModal();
			onSuccess?.(result.data.id);
		} catch (err) {
			console.error("Unexpected error:", err);
			toast({
				title: "خطأ غير متوقع",
				description: "حدث خطأ غير متوقع",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleClientCreated = (newClient: Client) => {
		// Invalidate clients query to refetch list
		queryClient.invalidateQueries({ queryKey: ["clients"] });
		// Set the newly created client as selected
		setInvoiceFormData((prev) => ({
			...prev,
			client_id: newClient.id,
		}));
	};



	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm"
						onClick={closeModal}
					/>
					<m.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.2 }}
						className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl z-10 overflow-hidden"
					>
						{/* Fixed Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
							<div>
								<Heading variant="h2">إنشاء فاتورة جديدة</Heading>
								<Text variant="body-small" color="muted" className="mt-1">
									قم بتعبئة التفاصيل أدناه لإنشاء فاتورة جديدة
								</Text>
							</div>
							<button
								onClick={closeModal}
								className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
							>
								<X size={24} />
							</button>
						</div>

						{/* Error Display */}
						{error && (
							<m.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
							>
								<AlertCircle size={20} className="text-red-600" />
								<span className="text-red-700 font-medium">{error}</span>
							</m.div>
						)}

						{/* Scrollable Body */}
						<div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
							<form
								id="create-invoice-form"
								onSubmit={handleInvoiceSubmit}
								className={layout.stack.large}
							>
								<InvoiceClientSection
									clients={clients}
									selectedClientId={invoiceFormData.client_id}
									onClientChange={(id) => setInvoiceFormData(prev => ({ ...prev, client_id: id }))}
									onClientCreated={handleClientCreated}
								/>

								<InvoiceDetailsForm
									formData={invoiceFormData}
									onChange={handleInvoiceInputChange}
									onTypeChange={(newType) => {
										setInvoiceFormData((prev) => ({
											...prev,
											invoice_type: newType,
											tax_rate: newType === "non_tax" ? 0 : prev.tax_rate || 15,
										}));
									}}
								/>

								<InvoiceItemsTable
									items={invoiceFormData.items}
									products={products}
									onItemChange={handleInvoiceItemChange}
									onAddItem={addInvoiceItem}
									onRemoveItem={removeInvoiceItem}
									formatCurrency={formatCurrency}
								/>

								<InvoiceSummary
									items={invoiceFormData.items}
									taxRate={invoiceFormData.tax_rate || 0}
									invoiceType={invoiceFormData.invoice_type}
									formatCurrency={formatCurrency}
								/>
							</form>
						</div>

						{/* Fixed Footer */}
						<div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
							<div className="hidden md:block">
								{invoiceFormData.client_id ? (
									<Text variant="body-small" color="muted" className="flex items-center gap-2">
										<User size={16} />
										جاري إنشاء الفاتورة لـ{" "}
										<span className="font-semibold text-gray-900">
											{clients.find((c) => c.id === invoiceFormData.client_id)?.name}
										</span>
									</Text>
								) : (
									<Text variant="body-small" color="muted">
										يرجى اختيار العميل أولاً
									</Text>
								)}
							</div>

							<div className={cn("flex w-full md:w-auto", layout.gap.standard)}>
								<Button
									type="button"
									variant="secondary"
									onClick={closeModal}
									className="flex-1 md:flex-none"
								>
									إلغاء
								</Button>

								<Button
									form="create-invoice-form"
									type="submit"
									variant="primary"
									disabled={saving}
									className="flex-1 md:flex-none flex items-center justify-center gap-2"
								>
									{saving ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
									{saving ? "جاري الحفظ..." : "إنشاء الفاتورة"}
								</Button>
							</div>
						</div>
					</m.div>
				</div>
			)}
		</AnimatePresence>
	);
}
