"use client";

import { useState } from "react";
import {
	ShieldCheck,
	Lock,
	LogOut,
	Mail,
	MessageSquare,
	Globe2,
	Clock4,
	CreditCard,
	ArrowUpRight,
	ArrowDownRight,
	Trash2,
	Download,
	Settings
} from "lucide-react";
import { m } from "framer-motion";
import { Heading, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

interface InvoiceItem {
	id: string;
	date: string;
	amount: number;
	status: "paid" | "unpaid";
	link: string;
}



export default function SettingsPage() {
	// Security
	const [twoFA, setTwoFA] = useState(false);
	const [alertLogins, setAlertLogins] = useState(true);

	// Notifications
	const [emailNotif, setEmailNotif] = useState(true);
	const [smsNotif, setSmsNotif] = useState(false);
	const [frequency, setFrequency] = useState<
		"immediate" | "daily" | "weekly"
	>("immediate");

	// System
	const [language, setLanguage] = useState("ar");
	const [currency, setCurrency] = useState("SAR");
	const [timezone, setTimezone] = useState("auto");

	// Billing
	const [currentPlan] = useState<"Free" | "Pro" | "Team">("Pro");
	const renewalDate = "2025-12-31";
	const invoices: InvoiceItem[] = [
		{
			id: "INV-001",
			date: "2025-06-01",
			amount: 99,
			status: "paid",
			link: "#",
		},
		{
			id: "INV-002",
			date: "2025-05-01",
			amount: 99,
			status: "paid",
			link: "#",
		},
		{
			id: "INV-003",
			date: "2025-04-01",
			amount: 99,
			status: "paid",
			link: "#",
		},
	];

	// Team (visible only for Team plan)

	const formatSar = (n: number) =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "SAR",
			maximumFractionDigits: 0,
		}).format(n);

	const onChangePassword = (e: React.FormEvent) => {
		e.preventDefault();
		// Integrate with backend
	};

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
			<m.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col gap-2"
			>
				<Heading variant="h1">الإعدادات</Heading>
				<p className="text-gray-500">تحكم في إعدادات حسابك، الأمان، والفوترة</p>
			</m.div>

			{/* Security */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<ShieldCheck className="text-[#7f2dfb]" size={24} />
					الأمان والحماية
				</h2>
				<form
					onSubmit={onChangePassword}
					className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
				>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							كلمة المرور الحالية
						</label>
						<div className="relative">
							<Lock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								type="password"
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							كلمة المرور الجديدة
						</label>
						<div className="relative">
							<Lock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								type="password"
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							تأكيد كلمة المرور
						</label>
						<div className="relative">
							<Lock
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
								size={18}
							/>
							<input
								type="password"
								className="w-full rounded-xl border border-gray-200 pr-10 pl-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div className="md:col-span-3 flex justify-end">
						<button
							type="submit"
							className="px-6 py-2.5 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-200 transition-all"
						>
							تحديث كلمة المرور
						</button>
					</div>
				</form>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-6">
					<div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-100 text-green-600 rounded-lg">
								<ShieldCheck size={20} />
							</div>
							<div>
								<p className="text-sm font-bold text-gray-900">التحقق بخطوتين (2FA)</p>
								<p className="text-xs text-gray-500">حماية إضافية لحسابك</p>
							</div>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
						</label>
					</div>

					<div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
								<Lock size={20} />
							</div>
							<div>
								<p className="text-sm font-bold text-gray-900">تنبيهات الدخول</p>
								<p className="text-xs text-gray-500">تنبيه عند تسجيل الدخول من جهاز جديد</p>
							</div>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" checked={alertLogins} onChange={(e) => setAlertLogins(e.target.checked)} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
						</label>
					</div>
				</div>

				<div className="flex justify-end mt-6">
					<button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-colors">
						<LogOut size={16} /> تسجيل الخروج من جميع الأجهزة
					</button>
				</div>
			</m.div>

			{/* Notifications */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<Mail className="text-[#7f2dfb]" size={24} />
					الإشعارات
				</h2>
				<div className="space-y-4">
					<label className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
						<span className="flex items-center gap-3 text-sm font-medium text-gray-700">
							<div className="p-2 bg-purple-100 text-[#7f2dfb] rounded-lg">
								<Mail size={18} />
							</div>
							إشعارات البريد الإلكتروني
						</span>
						<label className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
						</label>
					</label>
					<label className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
						<span className="flex items-center gap-3 text-sm font-medium text-gray-700">
							<div className="p-2 bg-purple-100 text-[#7f2dfb] rounded-lg">
								<MessageSquare size={18} />
							</div>
							إشعارات الرسائل القصيرة (SMS)
						</span>
						<label className="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
						</label>
					</label>
				</div>
				<div className="mt-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						تكرار الإشعارات
					</label>
					<div className="relative w-full md:w-64">
						<Select
							value={frequency}
							onValueChange={(val) => setFrequency(val as "immediate" | "daily" | "weekly")}
						>
							<SelectTrigger className="w-full h-11 bg-white border-gray-200">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="immediate">فوري</SelectItem>
								<SelectItem value="daily">ملخص يومي</SelectItem>
								<SelectItem value="weekly">ملخص أسبوعي</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</m.div>

			{/* System Preferences */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<Settings className="text-[#7f2dfb]" size={24} />
					تفضيلات النظام
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="space-y-2">
						<label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
							<Globe2 size={15} className="text-gray-400" />
							اللغة
						</label>
						<Select
							value={language}
							onValueChange={(val) => setLanguage(val)}
						>
							<SelectTrigger className="w-full h-11 bg-white border-gray-200">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ar">العربية</SelectItem>
								<SelectItem value="en">English</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
							<CreditCard size={15} className="text-gray-400" />
							العملة الافتراضية
						</label>
						<Select
							value={currency}
							onValueChange={(val) => setCurrency(val)}
						>
							<SelectTrigger className="w-full h-11 bg-white border-gray-200">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="SAR">SAR</SelectItem>
								<SelectItem value="USD">USD</SelectItem>
								<SelectItem value="EUR">EUR</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
							<Clock4 size={15} className="text-gray-400" />
							المنطقة الزمنية
						</label>
						<Select
							value={timezone}
							onValueChange={(val) => setTimezone(val)}
						>
							<SelectTrigger className="w-full h-11 bg-white border-gray-200">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="auto">تلقائي</SelectItem>
								<SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
								<SelectItem value="UTC">UTC</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</m.div>

			{/* Billing & Subscription */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<CreditCard className="text-[#7f2dfb]" size={24} />
					الفوترة والاشتراك
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
						<div className="text-sm text-gray-500 font-medium mb-1">
							الخطة الحالية
						</div>
						<div className="text-2xl font-bold text-[#012d46] mb-1">
							{currentPlan}
						</div>
						<div className="text-xs text-gray-400 mb-4">
							تجدد في:{" "}
							{new Date(renewalDate).toLocaleDateString("en-GB")}
						</div>
						<div className="flex gap-2">
							<button className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] transition-colors">
								<ArrowUpRight size={14} /> ترقية
							</button>
							<button className="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors">
								<ArrowDownRight size={14} /> تخفيض
							</button>
						</div>
					</div>

					<div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
						<div className="text-sm text-gray-500 font-medium mb-1">طريقة الدفع</div>
						<div className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
							<CreditCard size={20} className="text-[#7f2dfb]" /> بطاقة ائتمان •••• 4242
						</div>
						<div className="flex gap-2">
							<button className="flex-1 inline-flex justify-center items-center px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors">
								تغيير البطاقة
							</button>
						</div>
					</div>

					<div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 md:col-span-1">
						<div className="text-sm text-gray-500 font-medium mb-3">
							آخر الفواتير
						</div>
						<div className="space-y-2">
							{invoices.map((inv) => (
								<div key={inv.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
									<div className="flex flex-col">
										<span className="text-xs font-bold text-gray-900">{inv.id}</span>
										<span className="text-[10px] text-gray-400">{new Date(inv.date).toLocaleDateString("en-GB")}</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold">{formatSar(inv.amount)}</span>
										<button className="text-gray-400 hover:text-[#7f2dfb] transition-colors">
											<Download size={14} />
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</m.div>

			{/* Danger Zone */}
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="bg-white rounded-3xl border border-red-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-red-600 mb-2">
					منطقة الخطر
				</h2>
				<p className="text-sm text-gray-500 mb-6">
					الرجاء استخدام هذه الإجراءات بحذر، لا يمكن التراجع عنها.
				</p>
				<div className="flex flex-col sm:flex-row gap-4">
					<button className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
						<Trash2 size={18} />
						حذف الحساب نهائياً
					</button>
					<button className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
						<Download size={18} />
						تصدير كل البيانات
					</button>
				</div>
			</m.div>
		</div>
	);
}
