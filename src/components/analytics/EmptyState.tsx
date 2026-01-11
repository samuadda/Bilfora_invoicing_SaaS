"use client";

import { FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AnalyticsEmptyState() {
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col items-center justify-center py-20 text-center"
		>
			<div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
				<FileText className="w-12 h-12 text-purple-600" />
			</div>
			<h3 className="text-2xl font-bold text-gray-900 mb-2">
				ابدأ بإنشاء فواتيرك الأولى
			</h3>
			<p className="text-gray-500 mb-8 max-w-md">
				لا توجد فواتير حتى الآن. ابدأ بإنشاء فاتورة جديدة لرؤية التحليلات
				والإحصائيات هنا.
			</p>
			<motion.button
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				onClick={() => router.push("/dashboard/invoices")}
				className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:bg-brand-primaryHover transition-all"
			>
				<Plus size={20} strokeWidth={2.5} />
				<span>إنشاء فاتورة جديدة</span>
			</motion.button>
		</motion.div>
	);
}

