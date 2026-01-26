"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, X, ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Heading, Text } from "@/components/ui";
import { productSchema, type ProductFormValues } from "@/lib/schemas/product";

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
	const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
	const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

	// Refs
	const unitInputRef = useRef<HTMLInputElement>(null);
	const unitDropdownRef = useRef<HTMLDivElement>(null);
	const categoryInputRef = useRef<HTMLInputElement>(null);
	const categoryDropdownRef = useRef<HTMLDivElement>(null);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProductFormValues>({
		resolver: zodResolver(productSchema) as any,
		defaultValues: {
			type: "service",
			name: "",
			unit_price: 0,
			cost_price: 0,
			unit: "مشروع",
			description: "",
			category: "",
			price_includes_vat: false,
		},
	});

	const type = watch("type");
	const unit = watch("unit");
	const category = watch("category");

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
			if (
				unitDropdownRef.current &&
				!unitDropdownRef.current.contains(event.target as Node) &&
				unitInputRef.current &&
				!unitInputRef.current.contains(event.target as Node)
			) {
				setIsUnitDropdownOpen(false);
			}
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
		if (type === "service" && unit === "حبة") {
			setValue("unit", "مشروع");
		} else if (type === "product" && unit === "مشروع") {
			setValue("unit", "حبة");
		}
	}, [type, unit, setValue]);

	const handleClose = useCallback(() => {
		reset();
		onClose();
	}, [onClose, reset]);

	const onSubmit = async (data: ProductFormValues) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				toast({
					title: "خطأ",
					description: "يجب تسجيل الدخول أولاً",
					variant: "destructive",
				});
				return;
			}

			// Calculate VAT logic
			let finalPrice = Number(data.unit_price) || 0;
			if (data.price_includes_vat && finalPrice > 0) {
				finalPrice = finalPrice / 1.15;
			}

			const payload = {
				user_id: user.id,
				name: data.name.trim(),
				description: data.description?.trim() || null,
				unit: data.unit?.trim() || null,
				unit_price: finalPrice,
				active: true,
				category: data.category?.trim() || null,
				cost_price: data.cost_price ?? 0,
				product_type: data.type,
			};

			const { error } = await supabase.from("products").insert(payload);

			if (error) throw error;

			toast({
				title: "تمت الإضافة",
				description: `تم إضافة ${data.type === "service" ? "الخدمة" : "المنتج"} بنجاح`,
			});

			handleClose();
			if (onSuccess) onSuccess();
		} catch (e: unknown) {
			console.error(e);
			toast({
				title: "خطأ",
				description: (e as Error).message || "حدث خطأ غير متوقع",
				variant: "destructive",
			});
		}
	};

	const currentUnitPresets = type === "service" ? SERVICE_UNITS : PRODUCT_UNITS;
	const filteredPresets = currentUnitPresets.filter(
		(p) => p.value.includes(unit || "") || p.label.toLowerCase().includes((unit || "").toLowerCase())
	);

	const filteredCategories = CATEGORY_SUGGESTIONS.filter(
		(c) => c.includes(category || "")
	);

	const inputBaseClasses = "w-full rounded-xl border text-sm px-4 py-2.5 transition-all outline-none";
	const inputNormalClasses = "border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20";
	const inputErrorClasses = "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100";

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
								<Heading variant="h3">إضافة {type === "service" ? "خدمة" : "منتج"} جديد</Heading>
								<Text variant="body-small" color="muted" className="mt-1">
									أضف تفاصيل {type === "service" ? "الخدمة" : "المنتج"} لقائمة الأسعار
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

						{/* Scrollable Form */}
						<div className="overflow-y-auto p-6 scrollbar-hide">
							<form id="product-form" onSubmit={handleSubmit((data) => onSubmit(data as unknown as ProductFormValues))} className="space-y-5">

								{/* 1. Type Toggle */}
								<div className="bg-gray-100 p-1 rounded-xl flex">
									<button
										type="button"
										onClick={() => setValue("type", "service")}
										className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-sm font-medium ${type === "service"
											? "bg-white shadow-sm text-[#7f2dfb]"
											: "text-gray-600 hover:text-gray-800"
											}`}
									>
										خدمة (Service)
									</button>
									<button
										type="button"
										onClick={() => setValue("type", "product")}
										className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all text-sm font-medium ${type === "product"
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
										{...register("name")}
										className={`${inputBaseClasses} ${errors.name ? inputErrorClasses : inputNormalClasses}`}
										placeholder={type === "service" ? "مثال: تصميم شعار، ورشة عمل..." : "مثال: ايفون 15، طابعة..."}
									/>
									{errors.name && (
										<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
											<AlertCircle size={12} />
											{errors.name.message}
										</p>
									)}
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
											step="any"
											{...register("unit_price", { valueAsNumber: true })}
											className={`${inputBaseClasses} ${errors.unit_price ? inputErrorClasses : inputNormalClasses}`}
										/>
										{errors.unit_price && (
											<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
												<AlertCircle size={12} />
												{errors.unit_price.message}
											</p>
										)}
									</div>
									{/* Cost Price */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
											<span>سعر التكلفة</span>
											<span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 rounded-md">اختياري</span>
										</label>
										<input
											type="number"
											step="any"
											{...register("cost_price", { valueAsNumber: true })}
											placeholder="0"
											className={`${inputBaseClasses} ${errors.cost_price ? inputErrorClasses : inputNormalClasses} bg-gray-50/50`}
										/>
										{errors.cost_price && (
											<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
												<AlertCircle size={12} />
												{errors.cost_price.message}
											</p>
										)}
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
												{...(() => {
													const { ref: unitRegisterRef, ...unitRest } = register("unit");
													return {
														...unitRest,
														ref: (e: HTMLInputElement | null) => {
															unitRegisterRef(e);
															// @ts-ignore
															unitInputRef.current = e;
														}
													};
												})()}
												type="text"
												onFocus={() => setIsUnitDropdownOpen(true)}
												className={`${inputBaseClasses} ${errors.unit ? inputErrorClasses : inputNormalClasses} pl-10`}
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
																setValue("unit", preset.value);
																setIsUnitDropdownOpen(false);
															}}
															className="w-full px-4 py-2 text-sm text-right hover:bg-purple-50 hover:text-[#7f2dfb] transition-colors flex items-center justify-between"
														>
															<span className="font-medium">{preset.value}</span>
															<span className="text-xs text-gray-400">{preset.label.split("(")[1]?.replace(")", "")}</span>
														</button>
													))}
												</m.div>
											)}
										</AnimatePresence>
										{errors.unit && (
											<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
												<AlertCircle size={12} />
												{errors.unit.message}
											</p>
										)}
									</div>

									{/* Tax Toggle */}
									<div className="pt-7">
										<label className="flex items-center gap-3 cursor-pointer group select-none">
											<div className="relative">
												<input
													type="checkbox"
													{...register("price_includes_vat")}
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
											{...(() => {
												const { ref: catRegisterRef, ...catRest } = register("category");
												return {
													...catRest,
													ref: (e: HTMLInputElement | null) => {
														catRegisterRef(e);
														// @ts-ignore
														categoryInputRef.current = e;
													}
												};
											})()}
											type="text"
											onFocus={() => setIsCategoryDropdownOpen(true)}
											className={`${inputBaseClasses} ${errors.category ? inputErrorClasses : inputNormalClasses} pl-10`}
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
																setValue("category", cat);
																setIsCategoryDropdownOpen(false);
															}}
															className="w-full px-4 py-2 text-sm text-right hover:bg-purple-50 hover:text-[#7f2dfb] transition-colors"
														>
															{cat}
														</button>
													))
												) : (
													category && (
														<button
															type="button"
															onClick={() => setIsCategoryDropdownOpen(false)}
															className="w-full px-4 py-2 text-sm text-right text-[#7f2dfb] bg-purple-50 font-medium"
														>
															إضافة &quot;{category}&quot; كفئة جديدة
														</button>
													)
												)}
											</m.div>
										)}
									</AnimatePresence>
									{errors.category && (
										<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
											<AlertCircle size={12} />
											{errors.category.message}
										</p>
									)}
								</div>

								{/* 6. Description */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										الوصف
									</label>
									<textarea
										{...register("description")}
										className={`${inputBaseClasses} ${errors.description ? inputErrorClasses : inputNormalClasses} resize-none`}
										rows={3}
										placeholder="تفاصيل إضافية..."
									/>
									{errors.description && (
										<p className="mt-1 text-xs text-red-600 flex items-center gap-1">
											<AlertCircle size={12} />
											{errors.description.message}
										</p>
									)}
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
								disabled={isSubmitting}
								className="flex-1 px-4 py-2.5 rounded-xl bg-[#7f2dfb] text-white font-medium hover:bg-[#6b24d4] shadow-lg shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
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
