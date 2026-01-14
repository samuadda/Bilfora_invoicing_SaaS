"use client";

import { useMemo, useRef, useState } from "react";
import {
	Mail,
	MessageSquare,
	Bell,
	FileText,
	CheckCircle,
	AlertCircle,
	ShieldCheck,
	BadgeCheck,
	AlertTriangle,
	Clock4,
	Send,
	RotateCcw,
	ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

type Frequency = "immediate" | "daily" | "weekly";

type TypeKey =
	| "newInvoice"
	| "paymentReceived"
	| "overdueReminder"
	| "systemAlerts"
	| "securityAlerts";

type Channels = { email: boolean; sms: boolean };

interface MatrixState {
	newInvoice: Channels;
	paymentReceived: Channels;
	overdueReminder: Channels;
	systemAlerts: Channels;
	securityAlerts: Channels;
	channels: Channels;
	pausedAll: boolean;
	frequency: Frequency;
	dnd: { enabled: boolean; start: string; end: string };
	snoozeUntil: string;
	verified: { email: boolean; sms: boolean };
}

const defaultState: MatrixState = {
	newInvoice: { email: true, sms: false },
	paymentReceived: { email: true, sms: false },
	overdueReminder: { email: true, sms: true },
	systemAlerts: { email: true, sms: false },
	securityAlerts: { email: true, sms: false },
	channels: { email: true, sms: false },
	pausedAll: false,
	frequency: "immediate",
	dnd: { enabled: false, start: "22:00", end: "08:00" },
	snoozeUntil: "",
	verified: { email: true, sms: false },
};

export default function NotificationsPage() {
	const [state, setState] = useState<MatrixState>(defaultState);
	const initialRef = useRef<MatrixState>(defaultState);
	const [saving, setSaving] = useState(false);

	const dirty = useMemo(
		() => JSON.stringify(state) !== JSON.stringify(initialRef.current),
		[state]
	);

	const setChannel = (key: keyof MatrixState["channels"], value: boolean) =>
		setState((s) => ({ ...s, channels: { ...s.channels, [key]: value } }));

	const setTypeChannel = (
		typeKey: TypeKey,
		channel: keyof Channels,
		value: boolean
	) =>
		setState((s) => ({
			...s,
			[typeKey]: { ...s[typeKey], [channel]: value },
		}));

	const selectAll = () => {
		setState((s) => ({
			...s,
			channels: { email: true, sms: true },
			newInvoice: { email: true, sms: true },
			paymentReceived: { email: true, sms: true },
			overdueReminder: { email: true, sms: true },
			systemAlerts: { email: true, sms: true },
			securityAlerts: { email: true, sms: true },
		}));
	};

	const resetDefaults = () => setState(defaultState);

	const onSave = async () => {
		setSaving(true);
		setTimeout(() => {
			initialRef.current = state;
			setSaving(false);
		}, 600);
	};

	const onDiscard = () => setState(initialRef.current);

	const emailDisabled = !state.channels.email || state.pausedAll;
	const smsDisabled = !state.channels.sms || state.pausedAll;

	return (
		<div className="space-y-8 pb-24">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col gap-2"
			>
				<h1 className="text-3xl font-bold text-[#012d46]">الإشعارات</h1>
				<p className="text-gray-500">تحكم في كيفية ووقت استلامك للتنبيهات</p>
			</motion.div>

			{/* Channels with verification and test */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-bold text-[#012d46] flex items-center gap-2">
						<Bell className="text-[#7f2dfb]" size={24} />
						قنوات التواصل
					</h2>
					<div className="flex items-center gap-2">
						<button
							onClick={selectAll}
							className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors"
						>
							<CheckCircle size={14} /> تحديد الكل
						</button>
						<button
							onClick={resetDefaults}
							className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors"
						>
							<RotateCcw size={14} /> استعادة
						</button>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-100 text-[#7f2dfb] rounded-lg">
								<Mail size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<p className="font-bold text-gray-900 text-sm">البريد الإلكتروني</p>
									{state.verified.email ? (
										<span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-200">
											<BadgeCheck size={10} /> موثق
										</span>
									) : (
										<button className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200 hover:bg-amber-200">
											<AlertTriangle size={10} /> تحقق
										</button>
									)}
								</div>
								<p className="text-xs text-gray-500 mt-0.5">استلام الفواتير والتنبيهات الهامة</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<button className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-white transition-colors">
								<Send size={12} /> اختبار
							</button>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={state.channels.email}
									onChange={(e) => setChannel("email", e.target.checked)}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
							</label>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
								<MessageSquare size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<p className="font-bold text-gray-900 text-sm">الرسائل القصيرة (SMS)</p>
									{state.verified.sms ? (
										<span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-200">
											<BadgeCheck size={10} /> موثق
										</span>
									) : (
										<button className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200 hover:bg-amber-200">
											<AlertTriangle size={10} /> تحقق
										</button>
									)}
								</div>
								<p className="text-xs text-gray-500 mt-0.5">تنبيهات فورية ورموز التحقق</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<button className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-white transition-colors">
								<Send size={12} /> اختبار
							</button>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={state.channels.sms}
									onChange={(e) => setChannel("sms", e.target.checked)}
									className="sr-only peer"
								/>
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
							</label>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Matrix */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<CheckCircle className="text-[#7f2dfb]" size={24} />
					تخصيص التنبيهات
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-100">
								<th className="text-right px-4 py-3 font-bold text-gray-500 w-1/2">نوع التنبيه</th>
								<th className="text-center px-4 py-3 font-bold text-gray-500">Email</th>
								<th className="text-center px-4 py-3 font-bold text-gray-500">SMS</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{(
								[
									{
										key: "newInvoice",
										labelIcon: <FileText size={16} className="text-blue-600" />,
										label: "فواتير جديدة صادرة",
									},
									{
										key: "paymentReceived",
										labelIcon: <CheckCircle size={16} className="text-green-600" />,
										label: "استلام دفعة مالية",
									},
									{
										key: "overdueReminder",
										labelIcon: <AlertCircle size={16} className="text-orange-600" />,
										label: "تذكير بفاتورة مستحقة",
									},
									{
										key: "systemAlerts",
										labelIcon: <Bell size={16} className="text-gray-600" />,
										label: "تحديثات النظام",
									},
									{
										key: "securityAlerts",
										labelIcon: <ShieldCheck size={16} className="text-purple-600" />,
										label: "تنبيهات الأمان",
									},
								] as { key: TypeKey; labelIcon: React.ReactNode; label: string }[]
							).map((row) => (
								<tr key={row.key} className="hover:bg-gray-50/50 transition-colors">
									<td className="px-4 py-4">
										<span className="inline-flex items-center gap-3 font-medium text-gray-700">
											<div className="p-2 bg-gray-50 rounded-lg">{row.labelIcon}</div>
											{row.label}
										</span>
									</td>
									<td className="px-4 py-4 text-center">
										<input
											type="checkbox"
											checked={state[row.key].email}
											onChange={(e) => setTypeChannel(row.key, "email", e.target.checked)}
											disabled={emailDisabled}
											className="w-5 h-5 rounded border-gray-300 text-[#7f2dfb] focus:ring-[#7f2dfb] disabled:opacity-40 cursor-pointer"
										/>
									</td>
									<td className="px-4 py-4 text-center">
										<input
											type="checkbox"
											checked={state[row.key].sms}
											onChange={(e) => setTypeChannel(row.key, "sms", e.target.checked)}
											disabled={smsDisabled}
											className="w-5 h-5 rounded border-gray-300 text-[#7f2dfb] focus:ring-[#7f2dfb] disabled:opacity-40 cursor-pointer"
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</motion.div>

			{/* Advanced: frequency, DND, snooze, pause */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm"
			>
				<h2 className="text-xl font-bold text-[#012d46] mb-6 flex items-center gap-2">
					<Clock4 className="text-[#7f2dfb]" size={24} />
					إعدادات متقدمة
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div className="space-y-2">
						<label className="text-sm font-bold text-gray-700 block">تكرار التنبيهات</label>
						<div className="relative">
							<select
								value={state.frequency}
								onChange={(e) => setState((s) => ({ ...s, frequency: e.target.value as Frequency }))}
								className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all bg-white"
							>
								<option value="immediate">فوري (ينصح به)</option>
								<option value="daily">ملخص يومي</option>
								<option value="weekly">ملخص أسبوعي</option>
							</select>
							<ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="text-sm font-bold text-gray-700">وضع عدم الإزعاج</label>
							<label className="relative inline-flex items-center cursor-pointer scale-75 origin-left">
								<input type="checkbox" checked={state.dnd.enabled} onChange={(e) => setState((s) => ({ ...s, dnd: { ...s.dnd, enabled: e.target.checked } }))} className="sr-only peer" />
								<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7f2dfb]"></div>
							</label>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="time"
								value={state.dnd.start}
								onChange={(e) => setState((s) => ({ ...s, dnd: { ...s.dnd, start: e.target.value } }))}
								className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
								disabled={!state.dnd.enabled}
							/>
							<span className="text-gray-400 font-medium">إلى</span>
							<input
								type="time"
								value={state.dnd.end}
								onChange={(e) => setState((s) => ({ ...s, dnd: { ...s.dnd, end: e.target.value } }))}
								className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white"
								disabled={!state.dnd.enabled}
							/>
						</div>
					</div>

					<div className="p-4 rounded-xl bg-red-50 border border-red-100">
						<label className="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								checked={state.pausedAll}
								onChange={(e) => setState((s) => ({ ...s, pausedAll: e.target.checked }))}
								className="w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
							/>
							<span className="text-sm font-bold text-red-800">إيقاف جميع الإشعارات مؤقتاً</span>
						</label>
						{state.pausedAll && (
							<p className="text-xs text-red-600 mt-2 pr-8 leading-relaxed">
								لن تستلم أي تنبيهات حتى تقوم بإلغاء هذا الخيار. قد تفوتك تحديثات هامة.
							</p>
						)}
					</div>
				</div>
			</motion.div>

			{/* Sticky save bar */}
			{dirty && (
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
				>
					<div className="bg-gray-900 text-white shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 border border-gray-800 backdrop-blur-md bg-opacity-95">
						<div className="text-sm font-medium pr-2">
							لديك تغييرات غير محفوظة
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={onDiscard}
								className="px-4 py-2 rounded-xl text-gray-300 text-sm font-bold hover:bg-white/10 transition-colors"
							>
								تجاهل
							</button>
							<button
								onClick={onSave}
								disabled={saving}
								className="px-6 py-2 rounded-xl bg-[#7f2dfb] text-white text-sm font-bold hover:bg-[#6a1fd8] shadow-lg shadow-purple-900/50 transition-all flex items-center gap-2"
							>
								{saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</div>
	);
}
