"use client";

import { useMemo, useState } from "react";
import {
	HelpCircle,
	MessageSquare,
	Mail,
	Phone,
	FileText,
	CreditCard,
	ShieldCheck,
	Settings,
	ExternalLink,
	Search,
    ChevronDown,
    ChevronUp,
    Send
} from "lucide-react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";

interface FaqItem {
	q: string;
	a: string;
	articleHref: string;
}

interface FaqSection {
	title: string;
	icon: React.ReactNode;
	items: FaqItem[];
	key: "invoices" | "account" | "billing";
}

const faqSections: FaqSection[] = [
	{
		title: "الفواتير",
		icon: <FileText className="text-blue-600" size={24} />,
		key: "invoices",
		items: [
			{
				q: "كيف أنشئ فاتورة جديدة؟",
				a: 'اذهب إلى قسم الفواتير ثم اضغط على "فاتورة جديدة"، قم بإدخال بيانات العميل والعناصر واحفظ.',
				articleHref: "/dashboard/help/articles/create-invoice",
			},
			{
				q: "تعديل نسبة الضريبة الافتراضية",
				a: "من إعدادات الفواتير > الضرائب والإرسال، حدّد نسبة الضريبة المطلوبة.",
				articleHref: "/dashboard/help/articles/invoice-tax",
			},
			{
				q: "تخصيص قالب الفاتورة",
				a: "من إعدادات الفواتير > الهوية البصرية ونمط القالب، اختر النمط واللون والشعار.",
				articleHref: "/dashboard/help/articles/invoice-template",
			},
		],
	},
	{
		title: "الحساب والأمان",
		icon: <ShieldCheck className="text-purple-600" size={24} />,
		key: "account",
		items: [
			{
				q: "تفعيل التحقق بخطوتين (2FA)",
				a: "من الإعدادات > الأمان فعّل زر التحقق بخطوتين لتأمين حسابك.",
				articleHref: "/dashboard/help/articles/enable-2fa",
			},
			{
				q: "تغيير كلمة المرور",
				a: "اذهب إلى الإعدادات > الأمان، وأدخل كلمة المرور الحالية والجديدة.",
				articleHref: "/dashboard/help/articles/change-password",
			},
			{
				q: "إدارة الفريق والأدوار",
				a: "في الإعدادات > إدارة الفريق (خطة Team)، أضف الأعضاء وحدّد الأدوار: Admin، Accountant، Viewer.",
				articleHref: "/dashboard/help/articles/team-roles",
			},
		],
	},
	{
		title: "الاشتراكات والدفع",
		icon: <CreditCard className="text-green-600" size={24} />,
		key: "billing",
		items: [
			{
				q: "عرض الفواتير وتنزيل PDF",
				a: "من الإعدادات > الفوترة والاشتراك، ستجد سجل الفواتير وزر التحميل.",
				articleHref: "/dashboard/help/articles/billing-history",
			},
			{
				q: "تغيير وسيلة الدفع",
				a: "من الإعدادات > الفوترة والاشتراك، اختر تغيير البطاقة أو إضافة Mada.",
				articleHref: "/dashboard/help/articles/change-payment",
			},
			{
				q: "ترقية أو تخفيض الخطة",
				a: "من بطاقة الخطة الحالية، استخدم أزرار ترقية/تخفيض.",
				articleHref: "/dashboard/help/articles/plan-upgrade",
			},
		],
	},
];

export default function HelpPage() {
	const [openKey, setOpenKey] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	const filteredSections = useMemo(() => {
		if (!searchTerm.trim()) return faqSections;
		const term = searchTerm.toLowerCase();
		return faqSections
			.map((sec) => ({
				...sec,
				items: sec.items.filter((it) =>
					it.q.toLowerCase().includes(term)
				),
			}))
			.filter((sec) => sec.items.length > 0);
	}, [searchTerm]);

	return (
		<div className="space-y-8 pb-10">
			{/* Header */}
            <m.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
            >
				<div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-purple-50 rounded-2xl">
					    <HelpCircle className="text-[#7f2dfb]" size={32} />
                    </div>
					<div>
						<h1 className="text-3xl font-bold text-[#012d46]">
							مركز المساعدة
						</h1>
						<p className="text-gray-500 mt-1">
							ابحث عن إجابات سريعة أو تواصل مع فريق الدعم المتخصص
						</p>
					</div>
				</div>
				<div className="relative w-full md:w-96">
					<Search
						className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
						size={20}
					/>
					<input
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="اكتب سؤالك هنا..."
						className="w-full rounded-2xl border border-gray-200 pr-12 pl-4 py-3.5 text-sm focus:border-[#7f2dfb] focus:ring-[#7f2dfb] transition-all shadow-sm"
					/>
				</div>
			</m.div>

			{/* Quick links */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Link
					href="/dashboard/invoices"
					className="bg-white rounded-2xl border border-gray-100 p-5 hover:bg-gray-50 transition-all hover:shadow-md group"
				>
					<div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
						    <FileText size={20} />
                        </div>
						<div>
							<div className="text-sm font-bold text-gray-900">
								الفواتير
							</div>
							<div className="text-xs text-gray-500 mt-0.5">
								إدارة الفواتير والأسئلة الشائعة
							</div>
						</div>
					</div>
				</Link>
				<Link
					href="/dashboard/settings"
					className="bg-white rounded-2xl border border-gray-100 p-5 hover:bg-gray-50 transition-all hover:shadow-md group"
				>
					<div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 text-gray-600 rounded-xl group-hover:scale-110 transition-transform">
						    <Settings size={20} />
                        </div>
						<div>
							<div className="text-sm font-bold text-gray-900">
								الإعدادات
							</div>
							<div className="text-xs text-gray-500 mt-0.5">
								الأمان، الإشعارات، التفضيلات
							</div>
						</div>
					</div>
				</Link>
				<Link
					href="/dashboard/settings"
					className="bg-white rounded-2xl border border-gray-100 p-5 hover:bg-gray-50 transition-all hover:shadow-md group"
				>
					<div className="flex items-center gap-4">
                        <div className="p-2 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
						    <CreditCard size={20} />
                        </div>
						<div>
							<div className="text-sm font-bold text-gray-900">
								الفوترة والاشتراك
							</div>
							<div className="text-xs text-gray-500 mt-0.5">
								الخطة، الدفع، الفواتير
							</div>
						</div>
					</div>
				</Link>
				<Link
					href="/dashboard/profile"
					className="bg-white rounded-2xl border border-gray-100 p-5 hover:bg-gray-50 transition-all hover:shadow-md group"
				>
					<div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
						    <ShieldCheck size={20} />
                        </div>
						<div>
							<div className="text-sm font-bold text-gray-900">
								الملف الشخصي
							</div>
							<div className="text-xs text-gray-500 mt-0.5">
								تحديث معلوماتك العامة
							</div>
						</div>
					</div>
				</Link>
			</div>

			{/* Grouped FAQ with articles */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {filteredSections.map((section, index) => (
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={section.title}
                            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                                <div className="p-2 bg-gray-50 rounded-xl">{section.icon}</div>
                                <h2 className="text-lg font-bold text-[#012d46]">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {section.items.map((item, idx) => {
                                    const id = `${section.key}-${idx}`;
                                    const isOpen = openKey === id;
                                    return (
                                        <div key={id} className="border border-gray-100 rounded-2xl overflow-hidden transition-colors hover:border-gray-200">
                                            <button
                                                onClick={() => setOpenKey(isOpen ? null : id)}
                                                className="w-full text-right flex items-center justify-between gap-4 p-4 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-sm font-bold text-gray-900">
                                                    {item.q}
                                                </span>
                                                <span className="text-gray-400">
                                                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </span>
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <m.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-4 pt-0 text-sm text-gray-600 bg-gray-50/50 border-t border-gray-100">
                                                            <p className="leading-relaxed mb-3">{item.a}</p>
                                                            <Link
                                                                href={item.articleHref}
                                                                className="inline-flex items-center gap-1 text-[#7f2dfb] hover:text-[#6a1fd8] text-xs font-bold"
                                                            >
                                                                قراءة المقال كاملاً <ExternalLink size={12} />
                                                            </Link>
                                                        </div>
                                                    </m.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </m.div>
                    ))}
                </div>

                {/* Contact support */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-[#012d46] mb-4">تواصل معنا</h3>
                        <div className="space-y-4">
                            <a
                                href="mailto:support@bilfora.com"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 group transition-colors border border-transparent hover:border-purple-100"
                            >
                                <div className="p-2 bg-purple-100 text-[#7f2dfb] rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <Mail size={18} /> 
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block">البريد الإلكتروني</span>
                                    <span className="text-sm font-bold text-gray-900">support@bilfora.com</span>
                                </div>
                            </a>
                            <a
                                href="tel:+966500000000"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 group transition-colors border border-transparent hover:border-purple-100"
                            >
                                <div className="p-2 bg-purple-100 text-[#7f2dfb] rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <Phone size={18} /> 
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block">الهاتف الموحد</span>
                                    <span className="text-sm font-bold text-gray-900" style={{direction: "ltr"}}>+966 50 000 0000</span>
                                </div>
                            </a>
                            
                            <div className="pt-4 border-t border-gray-100">
                                <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 mb-3">
                                    <MessageSquare size={18} /> محادثة مباشرة
                                </button>
                                <button className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                                    <MessageSquare size={18} /> تواصل عبر واتساب
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#7f2dfb] rounded-3xl p-6 shadow-xl shadow-purple-200 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full -mr-8 -mt-8" />
                        <h3 className="text-lg font-bold mb-4 relative z-10">
                            أرسل رسالة فورية
                        </h3>
                        <form className="space-y-3 relative z-10">
                            <input
                                placeholder="الاسم"
                                className="w-full rounded-xl border-0 bg-white/20 placeholder:text-purple-100 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                            />
                            <input
                                placeholder="البريد الإلكتروني"
                                type="email"
                                className="w-full rounded-xl border-0 bg-white/20 placeholder:text-purple-100 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                            />
                            <textarea
                                placeholder="كيف يمكننا مساعدتك؟"
                                className="w-full rounded-xl border-0 bg-white/20 placeholder:text-purple-100 text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm resize-none"
                                rows={3}
                            />
                            <button className="w-full py-3 rounded-xl bg-white text-[#7f2dfb] text-sm font-bold hover:bg-purple-50 active:translate-y-[1px] transition-all flex items-center justify-center gap-2 shadow-md">
                                <Send size={16} /> إرسال الرسالة
                            </button>
                        </form>
                    </div>
                </div>
			</div>
		</div>
	);
}
