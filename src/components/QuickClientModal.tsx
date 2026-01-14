"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		company_name: "",
		tax_number: "",
	});

	const resetForm = useCallback(() => {
		setForm({
			name: "",
			email: "",
			phone: "",
			company_name: "",
			tax_number: "",
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
				setError("اسم العميل مطلوب");
				return;
			}

			if (!form.phone?.trim()) {
				setError("رقم الجوال مطلوب");
				return;
			}

			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				setError("يجب تسجيل الدخول أولاً");
				return;
			}

			const payload = {
				user_id: user.id,
				name: form.name.trim(),
				email: form.email?.trim() || null,
				phone: form.phone.trim(),
				company_name: form.company_name?.trim() || null,
				tax_number: form.tax_number?.trim() || null,
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
			setError((e as Error).message || "حدث خطأ غير متوقع");
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
						<div className="p-6 border-b border-gray-100 bg-gray-50/50">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-bold text-gray-900">
									إضافة عميل جديد
								</h2>
								<button
									type="button"
									onClick={handleClose}
									className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
								>
									<X size={24} />
								</button>
							</div>
							<p className="text-sm text-gray-500 mt-1">
								أضِف بيانات العميل الجديد لبدء إنشاء الفواتير بسهولة.
							</p>
						</div>

						{/* Error Display */}
						{error && (
							<div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
								<AlertCircle size={20} className="text-red-600 flex-shrink-0" />
								<span className="text-red-700 text-sm font-medium">{error}</span>
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							{/* Name - Required */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									الاسم الكامل <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm"
									required
									placeholder="مثال: محمد السعدي"
								/>
							</div>

							{/* Phone - Required */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									رقم الجوال <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<input
										type="tel"
										value={form.phone}
										onChange={(e) => setForm({ ...form, phone: e.target.value })}
										className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm"
										required
										placeholder="05xxxxxxxx"
										dir="ltr"
									/>
								</div>
							</div>

							{/* Email - Optional */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">
									البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
								</label>
								<div className="relative">
									<Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
									<input
										type="email"
										value={form.email}
										onChange={(e) => setForm({ ...form, email: e.target.value })}
										className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm"
										placeholder="example@domain.com"
										dir="ltr"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								{/* Company Name - Optional */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										اسم الشركة <span className="text-gray-400 font-normal">(اختياري)</span>
									</label>
									<input
										type="text"
										value={form.company_name}
										onChange={(e) => setForm({ ...form, company_name: e.target.value })}
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm"
										placeholder="مثال: شركة الريّان"
									/>
								</div>

								{/* Tax Number - Optional */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										الرقم الضريبي <span className="text-gray-400 font-normal">(اختياري)</span>
									</label>
									<input
										type="text"
										value={form.tax_number}
										onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-brand-primary text-sm"
										placeholder="مثال: 310xxxxxxx"
										dir="ltr"
									/>
								</div>
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
									className="flex-1 px-4 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primaryHover shadow-lg shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
