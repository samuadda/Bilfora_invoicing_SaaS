"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, X, ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { z } from "zod";

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

// ─────────────────────────────────────────────────────────────────────────────
// UNIT PRESETS FOR AGENCIES
// ─────────────────────────────────────────────────────────────────────────────
const UNIT_PRESETS = [
	{ value: "ساعة", label: "ساعة (Hour)" },
	{ value: "يوم", label: "يوم (Day)" },
	{ value: "مشروع", label: "مشروع (Project)" },
	{ value: "شهر", label: "شهر (Month)" },
] as const;

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
	const unitInputRef = useRef<HTMLInputElement>(null);
	const unitDropdownRef = useRef<HTMLDivElement>(null);

	const [form, setForm] = useState({
		name: "",
		unit_price: 0,
		unit: "",
		description: "",
		category: "",
		price_includes_vat: false,
	});

	// Close dropdown when clicking outside
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
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const resetForm = useCallback(() => {
		setForm({
			name: "",
			unit_price: 0,
			unit: "",
			description: "",
			category: "",
			price_includes_vat: false,
		});
		setError(null);
		setIsUnitDropdownOpen(false);
	}, []);

	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose, resetForm]);

	const handleUnitSelect = (value: string) => {
		setForm({ ...form, unit: value });
		setIsUnitDropdownOpen(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSaving(true);
			setError(null);

			// Validate with Zod
			const validationResult = productSchema.safeParse({
				...form,
				unit: form.unit || undefined,
				description: form.description || undefined,
				category: form.category || undefined,
			});

			if (!validationResult.success) {
				const firstError = validationResult.error.issues[0];
				setError(firstError.message);
				return;
			}

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			// Calculate price based on VAT inclusion
			let finalPrice = Number(form.unit_price) || 0;
			if (form.price_includes_vat && finalPrice > 0) {
				// Price includes VAT, store the base price (excluding VAT)
				// VAT in KSA is 15%
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
			};

			const { error } = await supabase.from("products").insert(payload);

			if (error) throw error;

			toast({
				title: "تمت الإضافة",
				description: "تم حفظ المنتج/الخدمة بنجاح",
			});

			handleClose();
			if (onSuccess) onSuccess();
		} catch (e: unknown) {
			setError((e as Error).message || "حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	// Filter presets based on input
	const filteredPresets = UNIT_PRESETS.filter(
		(preset) =>
			preset.value.includes(form.unit) ||
			preset.label.toLowerCase().includes(form.unit.toLowerCase())
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
						className="bg-white rounded-3xl w-full max-w-lg shadow-2xl z-10 overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-purple-50 to-white">
							<h2 className="text-xl font-bold text-gray-900">
								إضافة منتج / خدمة
							</h2>
							<button
								type="button"
								onClick={handleClose}
								className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
							>
								<X size={24} />
							</button>
						</div>

						{/* Error Display */}
						{error && (
							<div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
								<AlertCircle size={20} className="text-red-600" />
								<span className="text-red-700 text-sm font-medium">{error}</span>
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							{/* Product/Service Name */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									اسم المنتج / الخدمة *
								</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none"
									required
									placeholder="مثال: تصميم هوية بصرية، استشارة تسويقية..."
								/>
							</div>

							{/* Price + Tax Toggle Row */}
							<div className="space-y-3">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											السعر <svg viewBox="0 0 1024 1024" fill="currentColor" className="inline w-3.5 h-3.5 text-gray-500" aria-label="ريال"><path d="M512.003 0C229.671 0 .847 228.824.847 511.156c0 282.333 228.824 510.844 511.156 510.844 282.333 0 511.156-228.512 511.156-510.844C1023.16 228.824 794.336 0 512.003 0zm0 924.195c-227.936 0-413.035-185.1-413.035-413.04 0-227.94 185.1-413.04 413.035-413.04 227.94 0 413.04 185.1 413.04 413.04 0 227.94-185.1 413.04-413.04 413.04zm224.262-247.652c-13.252 0-24.137 9.965-25.665 23.137-12.316 106.168-92.108 131.677-154.692 132.501v-90.14h61.212c14.155 0 25.665-11.508 25.665-25.666 0-14.153-11.509-25.664-25.665-25.664h-61.211v-33.45h61.212c14.155 0 25.665-11.51 25.665-25.666 0-14.155-11.509-25.665-25.665-25.665h-61.211v-64.33h62.679c14.155 0 25.665-11.51 25.665-25.666 0-14.155-11.509-25.664-25.665-25.664h-62.679v-84.1c56.05 3.203 82.03 18.825 82.966 19.45 5.156 3.359 11.125 5.003 17.065 5.003 9.577 0 19-4.256 25.293-12.327 9.89-12.708 7.615-31.029-5.091-40.92-4.094-3.188-50.22-37.828-145.587-37.828-33.135 0-67.115 4.49-101.07 13.38-57.214 14.97-84.505 44.45-93.51 57.576-9.065 13.212-5.666 31.326 7.578 40.373 4.83 3.302 10.345 4.893 15.826 4.893 9.109 0 18.062-4.412 23.482-12.483 2.34-3.569 17.532-23.045 60.08-34.172 22.778-5.956 46.164-8.973 69.496-8.973 6.111 0 12.095.221 17.94.596v69.533H401.74c-14.153 0-25.664 11.508-25.664 25.664 0 14.157 11.51 25.666 25.664 25.666h82.513v64.33H401.74c-14.153 0-25.664 11.51-25.664 25.665 0 14.157 11.51 25.666 25.664 25.666h82.513v33.45H401.74c-14.153 0-25.664 11.51-25.664 25.664 0 14.158 11.51 25.666 25.664 25.666h82.513v91.14c-32.59-2.403-59.756-11.434-78.558-26.075-28.107-21.89-71.27-80.733-26.01-201.52 6.05-16.139-3.406-33.685-20.185-37.471-15.29-3.451-30.84 5.818-35.017 20.904-37.16 134.263 7.644 218.025 51.547 254.32 29.888 24.701 71.816 40.512 118.62 44.763v30.606c0 14.157 11.509 25.666 25.665 25.666 14.153 0 25.665-11.509 25.665-25.666v-29.512c83.684-4.825 170.685-51.313 186.04-184.047 1.657-14.341-8.61-27.326-22.953-28.983a26.72 26.72 0 00-3.017-.173z" /></svg>
										</label>
										<input
											type="number"
											min="0"
											step="0.01"
											value={form.unit_price}
											onChange={(e) =>
												setForm({ ...form, unit_price: parseFloat(e.target.value) || 0 })
											}
											className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none"
										/>
									</div>

									{/* Unit Field - Smart Combobox */}
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
												<ChevronDown
													size={18}
													className={`text-gray-400 transition-transform ${isUnitDropdownOpen ? "rotate-180" : ""}`}
												/>
											</button>
										</div>

										{/* Dropdown */}
										<AnimatePresence>
											{isUnitDropdownOpen && filteredPresets.length > 0 && (
												<m.div
													ref={unitDropdownRef}
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
												>
													{filteredPresets.map((preset) => (
														<button
															key={preset.value}
															type="button"
															onClick={() => handleUnitSelect(preset.value)}
															className="w-full px-4 py-2.5 text-sm text-right hover:bg-[#7f2dfb]/5 transition-colors flex items-center justify-between group"
														>
															<span className="text-gray-600 text-xs group-hover:text-[#7f2dfb]">
																{preset.label.split("(")[1]?.replace(")", "")}
															</span>
															<span className="font-medium text-gray-800 group-hover:text-[#7f2dfb]">
																{preset.value}
															</span>
														</button>
													))}
												</m.div>
											)}
										</AnimatePresence>
									</div>
								</div>

								{/* Tax Toggle - Right below price row for visual association */}
								<label className="flex items-center gap-3 cursor-pointer group">
									<div className="relative">
										<input
											type="checkbox"
											checked={form.price_includes_vat}
											onChange={(e) =>
												setForm({ ...form, price_includes_vat: e.target.checked })
											}
											className="sr-only peer"
										/>
										{/* Custom Switch Track */}
										<div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-[#7f2dfb]/20 peer-checked:bg-[#7f2dfb] transition-all" />
										{/* Custom Switch Thumb */}
										<div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
									</div>
									<span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors select-none">
										السعر شامل الضريبة (15%)
									</span>
								</label>
							</div>

							{/* Category */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									الفئة
								</label>
								<input
									type="text"
									value={form.category}
									onChange={(e) => setForm({ ...form, category: e.target.value })}
									className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none"
									placeholder="مثال: تصميم، تسويق، استشارات..."
								/>
							</div>

							{/* Description - Expanded Textarea */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									الوصف
								</label>
								<textarea
									value={form.description}
									onChange={(e) => setForm({ ...form, description: e.target.value })}
									className="w-full rounded-xl border border-gray-200 focus:border-[#7f2dfb] focus:ring-2 focus:ring-[#7f2dfb]/20 text-sm px-4 py-2.5 transition-all outline-none resize-none"
									rows={3}
									placeholder="وصف تفصيلي للخدمة أو المنتج... (اختياري)"
								/>
							</div>

							{/* Footer */}
							<div className="flex gap-3 pt-4">
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
						</form>
					</m.div>
				</div>
			)}
		</AnimatePresence>
	);
}





