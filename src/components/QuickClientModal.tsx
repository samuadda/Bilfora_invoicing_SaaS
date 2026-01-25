"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, X, Phone, Mail, Building2, User, MapPin, Hash, FileText, ChevronDown } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Heading, Text } from "@/components/ui";
import { m, AnimatePresence } from "framer-motion";

// ── ZATCA Tax Number Validation ─────────────────────────────────────────────
const ZATCA_TAX_NUMBER_REGEX = /^3\d{13}3$/;

// ── Country Phone Codes ─────────────────────────────────────────────────────
const COUNTRY_CODES = [
	{ code: "+966", country: "السعودية", flag: "🇸🇦" },
	{ code: "+971", country: "الإمارات", flag: "🇦🇪" },
	{ code: "+973", country: "البحرين", flag: "🇧🇭" },
	{ code: "+965", country: "الكويت", flag: "🇰🇼" },
	{ code: "+968", country: "عُمان", flag: "🇴🇲" },
	{ code: "+974", country: "قطر", flag: "🇶🇦" },
	{ code: "+20", country: "مصر", flag: "🇪🇬" },
	{ code: "+962", country: "الأردن", flag: "🇯🇴" },
	{ code: "+961", country: "لبنان", flag: "🇱🇧" },
	{ code: "+970", country: "فلسطين", flag: "🇵🇸" },
	{ code: "+964", country: "العراق", flag: "🇮🇶" },
	{ code: "+967", country: "اليمن", flag: "🇾🇪" },
	{ code: "+963", country: "سوريا", flag: "🇸🇾" },
	{ code: "+212", country: "المغرب", flag: "🇲🇦" },
	{ code: "+213", country: "الجزائر", flag: "🇩🇿" },
	{ code: "+216", country: "تونس", flag: "🇹🇳" },
	{ code: "+218", country: "ليبيا", flag: "🇱🇾" },
	{ code: "+249", country: "السودان", flag: "🇸🇩" },
];

// ── Zod Schema with Conditional Validation ──────────────────────────────────
const baseSchema = z.object({
	client_type: z.enum(["individual", "organization"]),
	name: z.string().min(2, "الاسم قصير جداً"),
	phone_prefix: z.string(),
	phone: z.string().optional().or(z.literal("")),
	landline: z.string().optional().or(z.literal("")),
	email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
	address: z.string().optional().or(z.literal("")),
});

const individualSchema = baseSchema.extend({
	client_type: z.literal("individual"),
	tax_number: z.string().optional().or(z.literal("")),
	commercial_registration: z.string().optional().or(z.literal("")),
});

const organizationSchema = baseSchema.extend({
	client_type: z.literal("organization"),
	tax_number: z
		.string()
		.optional()
		.or(z.literal(""))
		.refine(
			(val) => !val || ZATCA_TAX_NUMBER_REGEX.test(val),
			"الرقم الضريبي غير صحيح (يجب أن يتكون من 15 رقم ويبدأ وينتهي بـ 3)"
		),
	commercial_registration: z.string().optional().or(z.literal("")),
});

export const clientFormSchema = z.discriminatedUnion("client_type", [
	individualSchema,
	organizationSchema,
]);

export type ClientFormData = z.infer<typeof clientFormSchema>;

// ── Component ───────────────────────────────────────────────────────────────
interface QuickClientModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function QuickClientModal({
	isOpen,
	onClose,
	onSuccess,
}: QuickClientModalProps) {
	const { toast } = useToast();
	const [saving, setSaving] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<ClientFormData>({
		resolver: zodResolver(clientFormSchema),
		defaultValues: {
			client_type: "individual",
			name: "",
			phone_prefix: "+966",
			phone: "",
			landline: "",
			email: "",
			tax_number: "",
			commercial_registration: "",
			address: "",
		},
	});

	const clientType = watch("client_type");
	const isOrganization = clientType === "organization";

	const handleClose = useCallback(() => {
		reset();
		onClose();
	}, [onClose, reset]);

	const onSubmit = async (data: ClientFormData) => {
		try {
			setSaving(true);

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				toast({
					title: "خطأ",
					description: "يجب تسجيل الدخول أولاً",
					variant: "destructive",
				});
				return;
			}

			// Format full phone with prefix
			const fullPhone = data.phone ? `${data.phone_prefix}${data.phone.replace(/^0+/, "")}` : null;

			const payload = {
				user_id: user.id,
				name: data.name.trim(),
				email: data.email?.trim() || null,
				phone: fullPhone,
				company_name: isOrganization ? data.name.trim() : null,
				tax_number: isOrganization && data.tax_number ? data.tax_number.trim() : null,
				address: data.address?.trim() || null,
				city: null, // Simple form does not capture city separately
				commercial_registration: isOrganization && data.commercial_registration
					? data.commercial_registration.trim()
					: null,
				// Map landline to notes
				notes: data.landline?.trim() ? `الهاتف: ${data.landline.trim()}` : null,
				status: "active" as const,
			};

			const { error } = await supabase.from("clients").insert(payload);

			if (error) throw error;

			toast({
				title: "تمت الإضافة",
				description: "تم حفظ العميل بنجاح",
			});

			handleClose();
			if (onSuccess) onSuccess();
		} catch (e: unknown) {
			toast({
				title: "خطأ",
				description: (e as Error).message || "حدث خطأ غير متوقع",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const inputBaseClasses = "w-full py-2.5 rounded-xl border text-sm transition-all focus:ring-2";
	const inputNormalClasses = "border-gray-200 focus:border-[#7f2dfb] focus:ring-purple-100";
	const inputErrorClasses = "border-red-300 focus:border-red-500 focus:ring-red-100";

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm"
						onClick={handleClose}
					/>
					<m.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
							<div>
								<Heading variant="h3">إضافة عميل جديد</Heading>
								<Text variant="body-small" color="muted" className="mt-1">
									أضِف بيانات العميل الجديد لبدء إنشاء الفواتير بسهولة.
								</Text>
							</div>
							<button
								type="button"
								onClick={handleClose}
								className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
							>
								<X size={24} />
							</button>
						</div>

						{/* Form - Scrollable */}
						<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto flex-1">
							{/* ── Client Type Toggle ───────────────────────────────────── */}
							<div className="bg-gray-100 p-1 rounded-xl flex">
								<label
									className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${!isOrganization
										? "bg-white shadow-sm text-[#7f2dfb]"
										: "text-gray-600 hover:text-gray-800"
										}`}
								>
									<input
										type="radio"
										value="individual"
										{...register("client_type")}
										className="sr-only"
									/>
									<User size={18} />
									أفراد
								</label>
								<label
									className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium ${isOrganization
										? "bg-white shadow-sm text-[#7f2dfb]"
										: "text-gray-600 hover:text-gray-800"
										}`}
								>
									<input
										type="radio"
										value="organization"
										{...register("client_type")}
										className="sr-only"
									/>
									<Building2 size={18} />
									شركات
								</label>
							</div>

							{/* ── Name Field ─────────────────────────────────────────── */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									{isOrganization ? "اسم المنشأة" : "الاسم الكامل"}{" "}
									<span className="text-red-500">*</span>
								</label>
								<div className="relative">
									{isOrganization ? (
										<Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									) : (
										<User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									)}
									<input
										type="text"
										{...register("name")}
										className={`${inputBaseClasses} pr-10 pl-4 ${errors.name ? inputErrorClasses : inputNormalClasses}`}
										placeholder={isOrganization ? "مثال: شركة الرّيان للتسويق" : "مثال: محمد السعدي"}
									/>
								</div>
								{errors.name && (
									<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
										<AlertCircle size={12} />
										{errors.name.message}
									</p>
								)}
							</div>

							{/* ── Phone & Landline Row ──────────────────────────────────────── */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										رقم الجوال <span className="text-gray-400 font-normal">(اختياري)</span>
									</label>
									<div className="flex gap-2">
										<div className="relative w-28 shrink-0">
											<Select
												value={watch("phone_prefix")}
												onValueChange={(val) => setValue("phone_prefix", val)}
											>
												<SelectTrigger className="w-full h-[42px] px-2 text-sm">
													<SelectValue placeholder="+966" />
												</SelectTrigger>
												<SelectContent>
													{COUNTRY_CODES.map((c) => (
														<SelectItem key={c.code} value={c.code}>
															{c.flag} {c.code}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="relative flex-1">
											<Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
											<input
												type="tel"
												{...register("phone")}
												className={`${inputBaseClasses} ${inputNormalClasses} pr-9 pl-4`}
												placeholder="5xxxxxxxx"
												dir="ltr"
											/>
										</div>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										رقم الهاتف <span className="text-gray-400 font-normal">(اختياري)</span>
									</label>
									<div className="relative">
										<Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
										<input
											type="tel"
											{...register("landline")}
											className={`${inputBaseClasses} ${inputNormalClasses} pr-9 pl-4`}
											placeholder="011xxxxxxx"
											dir="ltr"
										/>
									</div>
								</div>
							</div>

							{/* ── Email Field ────────────────────────────────────────── */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
								</label>
								<div className="relative">
									<Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<input
										type="email"
										{...register("email")}
										className={`${inputBaseClasses} pr-10 pl-4 ${errors.email ? inputErrorClasses : inputNormalClasses}`}
										placeholder="example@domain.com"
										dir="ltr"
									/>
								</div>
								{errors.email && (
									<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
										<AlertCircle size={12} />
										{errors.email.message}
									</p>
								)}
							</div>

							{/* ── Address Section (Simple) ────────────────────────────── */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
									<MapPin size={16} className="text-[#7f2dfb]" />
									العنوان{" "}
									{isOrganization ? (
										<span className="text-gray-400 font-normal">(اختياري)</span>
									) : (
										<span className="text-gray-400 font-normal">(اختياري)</span>
									)}
								</label>
								<textarea
									{...register("address")}
									rows={2}
									className={`${inputBaseClasses} ${inputNormalClasses} px-4 resize-none`}
									placeholder="المدينة، الحي، الشارع..."
								/>
							</div>

							{/* ── Organization-Only Fields ────────────────────────────── */}
							<AnimatePresence>
								{isOrganization && (
									<m.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="space-y-5 overflow-hidden"
									>
										{/* Tax Number */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1.5">
												الرقم الضريبي <span className="text-gray-400 font-normal">(اختياري)</span>
											</label>
											<div className="relative">
												<Hash className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
												<input
													type="text"
													{...register("tax_number")}
													className={`${inputBaseClasses} pr-10 pl-4 ${errors.tax_number ? inputErrorClasses : inputNormalClasses}`}
													placeholder="3xxxxxxxxxxxxxx3"
													dir="ltr"
													maxLength={15}
												/>
											</div>
											{errors.tax_number && (
												<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
													<AlertCircle size={12} />
													{errors.tax_number.message}
												</p>
											)}
										</div>

										{/* Commercial Registration */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1.5">
												السجل التجاري <span className="text-gray-400 font-normal">(اختياري)</span>
											</label>
											<div className="relative">
												<FileText className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
												<input
													type="text"
													{...register("commercial_registration")}
													className={`${inputBaseClasses} ${inputNormalClasses} pr-10 pl-4`}
													placeholder="10xxxxxxxxxx"
													dir="ltr"
													maxLength={15}
												/>
											</div>
										</div>
									</m.div>
								)}
							</AnimatePresence>

							{/* ── Footer Buttons ──────────────────────────────────────── */}
							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={handleClose}
									className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm"
								>
									إلغاء
								</button>
								<button
									type="submit"
									disabled={saving}
									className="flex-1 px-4 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6b24d6] shadow-lg shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
								>
									{saving ? (
										<>
											<Loader2 size={18} className="animate-spin" />
											جاري الحفظ...
										</>
									) : (
										"إضافة العميل"
									)}
								</button>
							</div>
						</form>
					</m.div>
				</div>
			)}
		</AnimatePresence>
	);
}
