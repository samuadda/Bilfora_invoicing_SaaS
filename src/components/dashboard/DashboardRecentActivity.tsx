"use client";

import { FileText, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActivityItem {
	type: "invoice" | "client";
	title: string;
	subtitle: string;
	amount?: number;
	time: string;
	icon: typeof FileText;
	color: "purple" | "blue";
	invoiceId?: string;
}

interface DashboardRecentActivityProps {
	activities: ActivityItem[];
	formatCurrency: (amount: number) => string;
	formatTimeAgo: (dateString: string) => string;
}

export default function DashboardRecentActivity({
	activities,
	formatCurrency,
	formatTimeAgo,
}: DashboardRecentActivityProps) {
	return (
		<div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
			<div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
				<div>
					<h3 className="text-lg font-bold text-[#012d46]">النشاطات الأخيرة</h3>
					<p className="text-xs text-gray-500 mt-1">آخر التحديثات على حسابك</p>
				</div>
			</div>

			{activities.length > 0 ? (
				<div className="flex-1 overflow-y-auto divide-y divide-gray-50">
					{activities.map((act, i) => {
						const Icon = act.icon;
						return (
							<motion.div
								key={i}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: i * 0.1 }}
								className={cn(
									"p-5 hover:bg-gray-50/50 transition-colors group",
									act.invoiceId && "cursor-pointer"
								)}
								onClick={() => {
									if (act.invoiceId) {
										window.location.href = `/dashboard/invoices/${act.invoiceId}`;
									}
								}}
							>
								<div className="flex items-start gap-4">
									<div
										className={cn(
											"w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300",
											act.color === "purple"
												? "bg-purple-50 text-[#7f2dfb]"
												: "bg-blue-50 text-blue-600"
										)}
									>
										<Icon size={20} strokeWidth={2.5} />
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="text-gray-900 font-bold text-sm mb-1 truncate">
											{act.title}
										</h4>
										<p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
											<span className="truncate">{act.subtitle}</span>
											{act.amount && (
												<span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-green-100 whitespace-nowrap">
													{formatCurrency(act.amount)}
												</span>
											)}
										</p>
										<p className="text-xs text-gray-400 mt-1.5">
											{formatTimeAgo(act.time)}
										</p>
									</div>
									{act.invoiceId && (
										<ArrowLeft
											size={16}
											className="text-gray-400 group-hover:text-[#7f2dfb] transition-colors flex-shrink-0 mt-1"
										/>
									)}
								</div>
							</motion.div>
						);
					})}
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center p-12 text-center">
					<div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
						<FileText className="text-gray-400 w-8 h-8" />
					</div>
					<h3 className="text-gray-900 font-bold text-sm mb-1">
						لا توجد نشاطات حديثة
					</h3>
					<p className="text-gray-500 text-xs">
						ابدأ بإنشاء فاتورة جديدة أو إضافة عميل
					</p>
				</div>
			)}
		</div>
	);
}

