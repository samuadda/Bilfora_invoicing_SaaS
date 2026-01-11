"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
	const [form, setForm] = useState({
		name: "",
		unit_price: 0,
		unit: "",
		description: "",
		category: "",
	});

	const resetForm = useCallback(() => {
		setForm({
			name: "",
			unit_price: 0,
			unit: "",
			description: "",
			category: "",
		});
		setError(null);
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

			if (!form.name?.trim()) {
				setError("اسم المنتج مطلوب");
				return;
			}

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			const payload: any = {
				user_id: user.id,
				name: form.name.trim(),
				description: form.description?.trim() || null,
				unit: form.unit?.trim() || null,
				unit_price: Number(form.unit_price) || 0,
				active: true,
				category: form.category?.trim() || null,
			};

			const { error } = await supabase.from("products").insert(payload);

			if (error) throw error;

			toast({
				title: "تمت الإضافة",
				description: "تم حفظ المنتج بنجاح",
			});

			handleClose();
			if (onSuccess) onSuccess();
		} catch (e: any) {
			setError(e.message || "حدث خطأ غير متوقع");
		} finally {
			setSaving(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm"
						onClick={handleClose}
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="bg-white rounded-3xl w-full max-w-lg shadow-2xl z-10 overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
							<h2 className="text-xl font-bold text-gray-900">
								إضافة منتج جديد
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
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									اسم المنتج *
								</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm px-4 py-2"
									required
									placeholder="اسم المنتج أو الخدمة"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										السعر (ريال)
									</label>
									<input
										type="number"
										min="0"
										step="0.01"
										value={form.unit_price}
										onChange={(e) =>
											setForm({ ...form, unit_price: parseFloat(e.target.value) || 0 })
										}
										className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm px-4 py-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										الوحدة
									</label>
									<input
										type="text"
										value={form.unit}
										onChange={(e) => setForm({ ...form, unit: e.target.value })}
										className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm px-4 py-2"
										placeholder="مثل: قطعة، ساعة..."
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									الفئة
								</label>
								<input
									type="text"
									value={form.category}
									onChange={(e) => setForm({ ...form, category: e.target.value })}
									className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm px-4 py-2"
									placeholder="فئة المنتج (اختياري)"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									الوصف
								</label>
								<textarea
									value={form.description}
									onChange={(e) => setForm({ ...form, description: e.target.value })}
									className="w-full rounded-xl border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm px-4 py-2"
									rows={3}
									placeholder="وصف المنتج (اختياري)"
								/>
							</div>

							{/* Footer */}
							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={handleClose}
									className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm"
								>
									إلغاء
								</button>
								<button
									type="submit"
									disabled={saving}
									className="flex-1 px-4 py-2 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primaryHover shadow-lg shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
								>
									{saving ? (
										<>
											<Loader2 size={18} className="animate-spin" />
											جاري الحفظ...
										</>
									) : (
										"إضافة المنتج"
									)}
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}





