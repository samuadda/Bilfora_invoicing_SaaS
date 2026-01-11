"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import {
	Loader2,
	AlertCircle,
	Trash2,
	Plus,
	X,
	User,
	FileText,
	Phone,
	Mail,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type {
	Client,
	CreateInvoiceInput,
	CreateInvoiceItemInput,
	InvoiceType,
	Product,
} from "@/types/database";
import { labelByInvoiceType } from "@/lib/invoiceTypeLabels";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
	Heading,
	Text,
	Button,
} from "@/components/ui";
import { layout } from "@/lib/ui/tokens";
import { InvoiceClientSection } from "@/components/invoice/InvoiceClientSection";
import { InvoiceDetailsForm } from "@/components/invoice/InvoiceDetailsForm";
import { InvoiceItemsTable } from "@/components/invoice/InvoiceItemsTable";
import { InvoiceSummary } from "@/components/invoice/InvoiceSummary";

interface InvoiceCreationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: (id?: string) => void;
}

type CreateInvoiceRpcRow = {
	id: string;
	invoice_number: string | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function pickRpcRow(data: unknown): CreateInvoiceRpcRow | null {
	// Postgres RETURNS TABLE => Supabase usually returns array of rows
	// Some setups return object-like; we handle both safely.
	if (!data) return null;

	if (Array.isArray(data)) {
		const first = data[0];
		if (!isObject(first)) return null;
		const id = typeof first.id === "string" ? first.id : null;
		const invoice_number =
			typeof first.invoice_number === "string"
				? first.invoice_number
				: first.invoice_number === null
					? null
					: null;

		return id ? { id, invoice_number } : null;
	}

	if (isObject(data)) {
		const id = typeof data.id === "string" ? data.id : null;
		const invoice_number =
			typeof data.invoice_number === "string"
				? data.invoice_number
				: data.invoice_number === null
					? null
					: null;

		return id ? { id, invoice_number } : null;
	}

	return null;
}

export default function InvoiceCreationModal({
	isOpen,
	onClose,
	onSuccess,
}: InvoiceCreationModalProps) {
	// Validation schemas
	const itemSchema = z.object({
		description: z.string().min(1, "الوصف مطلوب"),
		quantity: z.coerce.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
		unit_price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
	});

	const invoiceSchema = z.object({
		client_id: z.string().uuid("العميل غير صالح"),

		order_id: z.string().uuid().nullable().optional().or(z.literal("")),

		invoice_type: z.enum(["standard_tax", "simplified_tax", "non_tax"], {
			errorMap: () => ({ message: "نوع الفاتورة مطلوب" }),
		}),

		document_kind: z.enum(["invoice", "credit_note", "debit_note"]).optional(),

		issue_date: z.string().min(1, "تاريخ الإصدار مطلوب"),
		due_date: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
		status: z.enum(["draft", "sent", "paid", "cancelled"]),
		tax_rate: z.coerce.number().min(0).max(100),
		notes: z.string().optional(),
		items: z.array(itemSchema).min(1, "يجب إضافة عنصر واحد على الأقل"),
	});


	// Modal state
	const [clients, setClients] = useState<Client[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
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

	// Load data when modal opens
	useEffect(() => {
		if (isOpen) {
			loadClientsForInvoice();
			loadProducts();
		}
	}, [isOpen]);

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

	const loadClientsForInvoice = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("clients")
				.select("*")
				.eq("user_id", user.id)
				.eq("status", "active")
				.order("name");

			if (error) {
				console.error("Error loading clients:", error);
				return;
			}

			setClients(data || []);
		} catch (err) {
			console.error("Error loading clients:", err);
		}
	};

	const loadProducts = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("products")
				.select("*")
				.eq("user_id", user.id)
				.eq("active", true)
				.order("name");

			if (error) {
				console.error("Error loading products:", error);
				return;
			}

			setProducts(data || []);
		} catch (err) {
			console.error("Error loading products:", err);
		}
	};

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

		// extra guard against double submits
		if (saving) return;

		try {
			setSaving(true);
			setError(null);

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

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				toast({
					title: "غير مسجل",
					description: "يجب تسجيل الدخول أولاً",
					variant: "destructive",
				});
				return;
			}

			// enforce VAT=0 for non_tax invoices
			const finalTaxRate =
				invoiceFormData.invoice_type === "non_tax"
					? 0
					: Number(invoiceFormData.tax_rate) || 0;

			// Items payload for RPC (DB computes totals, generates invoice_number, inserts atomically)
			const itemsPayload = invoiceFormData.items.map((item) => ({
				description: item.description,
				quantity: Number(item.quantity) || 0,
				unit_price: Number(item.unit_price) || 0,
			}));

			const { data, error: invoiceError } = await supabase.rpc(
				"create_invoice_with_items",
				{
					p_client_id: invoiceFormData.client_id,
					p_order_id: null,
					p_invoice_type: invoiceFormData.invoice_type, p_document_kind: invoiceFormData.document_kind ?? "invoice",
					p_issue_date: invoiceFormData.issue_date,
					p_due_date: invoiceFormData.due_date,
					p_status: invoiceFormData.status,
					p_tax_rate: finalTaxRate,
					p_notes: invoiceFormData.notes ?? "",
					p_items: itemsPayload,
				},
			);

			if (invoiceError) {
				console.error("Error creating invoice via RPC:", invoiceError);
				const msg =
					invoiceError?.message ||
					invoiceError?.details ||
					"فشل في إنشاء الفاتورة";
				toast({
					title: "خطأ",
					description: msg,
					variant: "destructive",
				});
				return;
			}

			const created = pickRpcRow(data);
			if (!created?.id) {
				toast({
					title: "خطأ",
					description: "تم تنفيذ العملية لكن لم يتم استلام بيانات الفاتورة",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "تم إنشاء الفاتورة",
				description: created.invoice_number
					? `تم إنشاء الفاتورة بنجاح (${created.invoice_number})`
					: "تم إنشاء الفاتورة بنجاح",
			});

			closeModal();
			onSuccess?.(created.id);
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
		setClients((prev) => [...prev, newClient]);
		setInvoiceFormData((prev) => ({
			...prev,
			client_id: newClient.id,
		}));
	};

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 2,
		}).format(amount);

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm"
						onClick={closeModal}
					/>
					<motion.div
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
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
							>
								<AlertCircle size={20} className="text-red-600" />
								<span className="text-red-700 font-medium">{error}</span>
							</motion.div>
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
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
