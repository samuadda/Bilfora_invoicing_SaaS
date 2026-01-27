"use client";

export default function AnalyticsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-6">
			{/* Content */}
			{children}
		</div>
	);
}
