"use client";

import { m } from "framer-motion";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { MonthlyStats } from "@/hooks/useInvoiceStats";
import { Card, Text, Heading, Price } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";

interface MonthlyStatsCardsProps {
	stats: MonthlyStats;
}

export default function MonthlyStatsCards({
	stats,
}: MonthlyStatsCardsProps) {
	const cards = [
		{
			title: "إجمالي الفواتير",
			value: <Price amount={stats.totalInvoiced} size="xl" />,
			icon: DollarSign,
			color: "blue",
			delay: 0.1,
		},
		{
			title: "المحصل",
			value: <Price amount={stats.collected} size="xl" />,
			icon: CheckCircle,
			color: "green",
			delay: 0.2,
		},
		{
			title: "المستحقات",
			value: <Price amount={stats.outstanding} size="xl" />,
			icon: Clock,
			color: "orange",
			delay: 0.3,
		},
		{
			title: "فواتير متأخرة",
			value: stats.overdueCount,
			icon: AlertCircle,
			color: "red",
			delay: 0.4,
		},
	];

	const colors = {
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		orange: "bg-orange-50 text-orange-600",
		red: "bg-red-50 text-red-600",
	};

	return (
		<div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${layout.gap.standard}`}>
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<m.div
						key={card.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: card.delay, duration: 0.5 }}
					>
						<Card hover>
							<div className="flex items-center justify-between mb-4">
								<div
									className={`p-2.5 rounded-xl ${colors[card.color as keyof typeof colors]}`}
								>
									<Icon size={20} strokeWidth={2.5} />
								</div>
							</div>
							<div>
								<Text variant="body-small" color="muted" className="mb-1 font-medium">{card.title}</Text>
								<Heading variant="h3" className="tracking-tight">
									{card.value}
								</Heading>
							</div>
						</Card>
					</m.div>
				);
			})}
		</div>
	);
}
