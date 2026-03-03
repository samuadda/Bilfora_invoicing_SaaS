"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	User,
	FileText,
	Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "@/components/ui";
import { m } from "framer-motion";

const SETTINGS_TABS = [
	{ href: "/dashboard/settings", label: "عام", icon: User, exact: true },
	{ href: "/dashboard/settings/invoicing", label: "الفواتير", icon: FileText },
	{ href: "/dashboard/settings/notifications", label: "التنبيهات", icon: Bell, disabled: true },
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
						{SETTINGS_TABS.map((tab) => {
							const { href, label, icon: Icon } = tab;
							const exact = "exact" in tab && tab.exact;
							const disabled = "disabled" in tab && tab.disabled;
							const active = exact
								? pathname === href
								: pathname.startsWith(href);

							const content = (
								<>
									<Icon size={18} className={cn(disabled ? "text-gray-400" : active ? "text-[#7f2dfb]" : "text-gray-400")} />
									<span className="flex-1 text-right">{label}</span>
									{disabled && (
										<span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/10">
											قريباً
										</span>
									)}
								</>
							);

							const className = cn(
								"flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
								disabled ? "opacity-60 cursor-not-allowed bg-gray-50 text-gray-500" :
								active
									? "bg-[#7f2dfb]/10 text-[#7f2dfb] font-bold"
									: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
							);

							if (disabled) {
								return (
									<div key={href} className={className}>
										{content}
									</div>
								);
							}

							return (
								<Link
									key={href}
									href={href}
									className={className}
								>
									{content}
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
