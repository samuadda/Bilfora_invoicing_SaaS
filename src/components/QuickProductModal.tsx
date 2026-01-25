"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, X, ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { z } from "zod";

import { Heading, Text } from "@/components/ui";

// ─────────────────────────────────────────────────────────────────────────────
// ZOD SCHEMA FOR VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
export const productSchema = z.object({
	name: z.string().min(1, "اسم المنتج مطلوب").max(255, "اسم المنتج طويل جداً"),
	unit_price: z.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
	unit: z.string().max(50, "الوحدة طويلة جداً").optional(),
	description: z.string().max(1000, "الوصف طويل جداً").optional(),
	category: z.string().max(100, "الفئة طويلة جداً").optional(),
	price_includes_vat: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;



interface QuickProductModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function QuickProductModal({
	isOpen,
	onClose,
	onSuccess,
}: QuickProductModalProps) {
	const { toast } = useToast();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
	const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false); // New state for category
	
	// Refs
	const unitInputRef = useRef<HTMLInputElement>(null);
	const unitDropdownRef = useRef<HTMLDivElement>(null);
	const categoryInputRef = useRef<HTMLInputElement>(null);
	const categoryDropdownRef = useRef<HTMLDivElement>(null);

	const [form, setForm] = useState({
		type: "service" as "service" | "product",
		name: "",
		unit_price: 0,
		cost_price: 0, // New field
		unit: "مشروع", // Default for service
		description: "",
		category: "",
		price_includes_vat: false,
	});

	// Presets
	const SERVICE_UNITS = [
		{ value: "مشروع", label: "مشروع (Project)" },
		{ value: "ساعة", label: "ساعة (Hour)" },
		{ value: "يوم", label: "يوم (Day)" },
		{ value: "شهر", label: "شهر (Month)" },
	];

	const PRODUCT_UNITS = [
		{ value: "حبة", label: "حبة (Piece)" },
		{ value: "كرتون", label: "كرتون (Carton)" },
		{ value: "متر", label: "متر (Meter)" },
		{ value: "كجم", label: "كجم (Kg)" },
	];

	// Mock Categories (In real app, fetch these from DB or pass as prop)
	const CATEGORY_SUGGESTIONS = [
		"تطوير برمجيات",
		"تسويق إلكتروني",
		"تصميم جرافيك",
		"استشارات",
		"مطبوعات",
		"أجهزة إلكترونية",
	];

	// Close dropdowns
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Unit Dropdown
			if (
				unitDropdownRef.current &&
				!unitDropdownRef.current.contains(event.target as Node) &&
				unitInputRef.current &&
				!unitInputRef.current.contains(event.target as Node)
			) {
				setIsUnitDropdownOpen(false);
			}
			// Category Dropdown
			if (
				categoryDropdownRef.current &&
				!categoryDropdownRef.current.contains(event.target as Node) &&
				categoryInputRef.current &&
				!categoryInputRef.current.contains(event.target as Node)
			) {
				setIsCategoryDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Auto-switch unit when type changes
	useEffect(() => {
		if (form.type === "service" && form.unit === "حبة") {
			setForm(prev => ({ ...prev, unit: "مشروع" }));
		} else if (form.type === "product" && form.unit === "مشروع") {
			setForm(prev => ({ ...prev, unit: "حبة" }));
		}
	}, [form.type]);

	const resetForm = useCallback(() => {
		setForm({
			type: "service",
			name: "",
			unit_price: 0,
			cost_price: 0,
			unit: "مشروع",
			description: "",
			category: "",
			price_includes_vat: false,
		});
		setError(null);
		setIsUnitDropdownOpen(false);
		setIsCategoryDropdownOpen(false);
	}, []);

	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose, resetForm]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError(null);

			// Validate
			if (!form.name.trim()) {
				setError("اسم المنتج مطلوب");
				return;
			}
			if (form.unit_price < 0) {
				setError("سعر البيع لا يمكن أن يكون سالباً");
				return;
			}
			if (form.cost_price < 0) {
				setError("سعر التكلفة لا يمكن أن يكون سالباً");
				return;
			}

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			// Calculate VAT logic
			let finalPrice = Number(form.unit_price) || 0;
			if (form.price_includes_vat && finalPrice > 0) {
				finalPrice = finalPrice / 1.15;
			}

			const payload = {
				user_id: user.id,
				name: form.name.trim(),
				description: form.description?.trim() || null,
				unit: form.unit?.trim() || null,
				unit_price: finalPrice,
				active: true,
				category: form.category?.trim() || null,
				// New Fields - Ensure DB columns exist!
				cost_price: Number(form.cost_price) || 0,
				product_type: form.type, 
			};

			const { error } = await supabase.from("products").insert(payload);

			if (error) throw error;

			toast({
				title: "تمت الإضافة",
				description: `تم إضافة ${form.type === "service" ? "الخدمة" : "المنتج"} بنجاح`,
			});

			handleClose();
			if (onSuccess) onSuccess();
		} catch (e: unknown) {
			console.error(e); // Log for debugging
			setError((e as Error).message || "حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	const currentUnitPresets = form.type === "service" ? SERVICE_UNITS : PRODUCT_UNITS;
	const filteredPresets = currentUnitPresets.filter(
		(p) => p.value.includes(form.unit) || p.label.toLowerCase().includes(form.unit.toLowerCase())
	);
	
	const filteredCategories = CATEGORY_SUGGESTIONS.filter(
		(c) => c.includes(form.category)
	);

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
						className="bg-white rounded-3xl w-full max-w-lg shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shrink-0">
							<div>
								<Heading variant="h3">إضافة {form.type === "service" ? "خدمة" : "منتج"} جديد</Heading>
								<Text variant="body-small" color="muted" className="mt-1">
									أضف تفاصيل {form.type === "service" ? "الخدمة" : "المنتج"} لقائمة الأسعار
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

						{/* Error Display */}
						{error && (
							<div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 shrink-0">
								<AlertCircle size={20} className="text-red-600" />
								<span className="text-red-700 text-sm font-medium">{error}</span>
							</div>
						)}

						{/* Scrollable Form */}
						<div className="overflow-y-auto p-6 scrollbar-hide">
							<form id="product-form" onSubmit={handleSubmit} className="space-y-5">
								
								{/* 1. Type Toggle */}
								<div className="bg-gray-100 p-1 rounded-xl flex">
									<button
										type="button"
										onClick={() => setForm({ ...form, type: "service" })}
										className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-sm font-medium ${
											form.type === "service"
												? "bg-white shadow-sm text-[#7f2dfb]"
												: "text-gray-600 hover:text-gray-800"
										}`}
									>
										خدمة (Service)
									</button>
									<button
										type="button"
										onClick={() => setForm({ ...form, type: "product" })}
										className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-sm font-medium ${
											form.type === "product"
												? "bg-white shadow-sm text-[#7f2dfb]"
												: "text-gray-600 hover:text-gray-800"
										}`}
									>
										منتج (Product)
									</button>
								</div>

								{/* 2. Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										الاسم <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={form.name}
										onChange={(e) => setForm({ ...form, name: e.target.value })}
										className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none"
										required
										placeholder={form.type === "service" ? "مثال: تصميم شعار، ورشة عمل..." : "مثال: ايفون 15، طابعة..."}
									/>
								</div>

								{/* 3. Prices Row */}
								<div className="grid grid-cols-2 gap-4">
									{/* Selling Price */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											سعر البيع <span className="text-red-500">*</span>
										</label>
										<input
											type="number"
											min="0"
											step="1"
											value={form.unit_price}
											onChange={(e) =>
												setForm({ ...form, unit_price: parseFloat(e.target.value) || 0 })
											}
											className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none"
										/>
									</div>
									{/* Cost Price */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
											<span>سعر التكلفة</span>
											<span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 rounded-md">اختياري</span>
										</label>
										<input
											type="number"
											min="0"
											step="1"
											value={form.cost_price}
											onChange={(e) =>
												setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })
											}
											placeholder="0"
											className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none bg-gray-50/50"
										/>
										<p className="text-[10px] text-gray-400 mt-1 mr-1">
											لن يظهر للعميل، فقط لحساب الأرباح
										</p>
									</div>
								</div>

								{/* 4. Unit & Tax */}
								<div className="grid grid-cols-2 gap-4 items-start">
									{/* Unit */}
									<div className="relative">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											الوحدة
										</label>
										<div className="relative">
											<input
												ref={unitInputRef}
												type="text"
												value={form.unit}
												onChange={(e) => {
													setForm({ ...form, unit: e.target.value });
													setIsUnitDropdownOpen(true);
												}}
												onFocus={() => setIsUnitDropdownOpen(true)}
												className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 pl-10 transition-all outline-none"
												placeholder="اختر أو اكتب..."
											/>
											<button
												type="button"
												onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
												className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
											>
												<ChevronDown size={16} className="text-gray-400" />
											</button>
										</div>
										<AnimatePresence>
											{isUnitDropdownOpen && filteredPresets.length > 0 && (
												<m.div
													ref={unitDropdownRef}
													initial={{ opacity: 0, y: -5 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -5 }}
													className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden max-h-40 overflow-y-auto"
												>
													{filteredPresets.map((preset) => (
														<button
															key={preset.value}
															type="button"
															onClick={() => {
																setForm({ ...form, unit: preset.value });
																setIsUnitDropdownOpen(false);
															}}
															className="w-full px-4 py-2 text-sm text-right hover:bg-purple-50 hover:text-[#7f2dfb] transition-colors flex items-center justify-between"
														>
															<span className="font-medium">{preset.value}</span>
															<span className="text-xs text-gray-400">{preset.label.split("(")[1]?.replace(")","")}</span>
														</button>
													))}
												</m.div>
											)}
										</AnimatePresence>
									</div>

									{/* Tax Toggle */}
									<div className="pt-7">
										<label className="flex items-center gap-3 cursor-pointer group select-none">
											<div className="relative">
												<input
													type="checkbox"
													checked={form.price_includes_vat}
													onChange={(e) =>
														setForm({ ...form, price_includes_vat: e.target.checked })
													}
													className="sr-only peer"
												/>
												<div className="w-9 h-5 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-[#7f2dfb]/20 peer-checked:bg-[#7f2dfb] transition-all" />
												<div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-4" />
											</div>
											<span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
												شامل الضريبة (15%)
											</span>
										</label>
									</div>
								</div>

								{/* 5. Smart Category */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										الفئة
									</label>
									<div className="relative">
										<input
											ref={categoryInputRef}
											type="text"
											value={form.category}
											onChange={(e) => {
												setForm({ ...form, category: e.target.value });
												setIsCategoryDropdownOpen(true);
											}}
											onFocus={() => setIsCategoryDropdownOpen(true)}
											className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 pl-10 transition-all outline-none"
											placeholder="ابحث أو أنشئ فئة جديدة..."
										/>
										<button
											type="button"
											onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
											className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
										>
											<ChevronDown size={16} className="text-gray-400" />
										</button>
									</div>
									<AnimatePresence>
										{isCategoryDropdownOpen && (
											<m.div
												ref={categoryDropdownRef}
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden max-h-40 overflow-y-auto"
											>
												{filteredCategories.length > 0 ? (
													filteredCategories.map((cat) => (
														<button
															key={cat}
															type="button"
															onClick={() => {
																setForm({ ...form, category: cat });
																setIsCategoryDropdownOpen(false);
															}}
															className="w-full px-4 py-2 text-sm text-right hover:bg-purple-50 hover:text-[#7f2dfb] transition-colors"
														>
															{cat}
														</button>
													))
												) : (
													form.category && (
														<button
															type="button"
															onClick={() => setIsCategoryDropdownOpen(false)} // Just closes, value is already typed
															className="w-full px-4 py-2 text-sm text-right text-[#7f2dfb] bg-purple-50 font-medium"
														>
															إضافة &quot;{form.category}&quot; كفئة جديدة
														</button>
													)
												)}
											</m.div>
										)}
									</AnimatePresence>
								</div>

								{/* 6. Description */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										الوصف
									</label>
									<textarea
										value={form.description}
										onChange={(e) => setForm({ ...form, description: e.target.value })}
										className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none resize-none"
										rows={3}
										placeholder="تفاصيل إضافية..."
									/>
								</div>

							</form>
						</div>

						{/* Footer */}
						<div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 shrink-0">
							<button
								type="button"
								onClick={handleClose}
								className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm"
							>
								إلغاء
							</button>
							<button
								type="submit"
								form="product-form"
								disabled={saving}
								className="flex-1 px-4 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6b24d4] shadow-lg shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{saving ? (
									<>
										<Loader2 size={18} className="animate-spin" />
										جاري الحفظ...
									</>
								) : (
									"إضافة"
								)}
							</button>
						</div>
					</m.div>
				</div>
			)}
		</AnimatePresence>
	);
}





