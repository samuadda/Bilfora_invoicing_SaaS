"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	User,
	Building2,
	FileText,
	Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui";
import { m } from "framer-motion";

const SETTINGS_TABS = [
	{ href: "/dashboard/settings", label: "عام", icon: User, exact: true },
	{ href: "/dashboard/settings/business", label: "بيانات المنشأة", icon: Building2 },
	{ href: "/dashboard/settings/invoicing", label: "الفواتير", icon: FileText },
	{ href: "/dashboard/settings/notifications", label: "التنبيهات", icon: Bell },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<div className="space-y-6 pb-10">
			{/* Header */}
			<m.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col gap-1"
			>
				<Heading variant="h1">الإعدادات</Heading>
				<p className="text-gray-500">إدارة حسابك، منشأتك، فواتيرك، وإشعاراتك</p>
			</m.div>

			{/* 2-column layout */}
			<div className="flex flex-col md:flex-row gap-6">
				{/* Right column — Tab Navigation (RTL, so this appears on the right) */}
				<m.nav
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.05 }}
					className="w-full md:w-64 shrink-0"
				>
					<div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm sticky top-6 space-y-1">
						{SETTINGS_TABS.map(({ href, label, icon: Icon, ...rest }) => {
							const exact = "exact" in rest && rest.exact;
							const active = exact
								? pathname === href
								: pathname.startsWith(href);
							return (
								<Link
									key={href}
									href={href}
									className={cn(
										"flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
										active
											? "bg-[#7f2dfb]/10 text-[#7f2dfb] font-bold"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									)}
								>
									<Icon size={18} className={cn(active ? "text-[#7f2dfb]" : "text-gray-400")} />
									{label}
								</Link>
							);
						})}
					</div>
				</m.nav>

				{/* Left column — Content */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="flex-1 min-w-0"
				>
					{children}
				</m.div>
			</div>
		</div>
	);
}
