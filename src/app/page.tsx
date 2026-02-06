import { Metadata } from "next";
import LandingPageClient from "@/components/landing-page/LandingPageClient";

/**
 * Landing page metadata for SEO optimization.
 * This runs on the server for better performance.
 */
export const metadata: Metadata = {
	title: "بِلفورا - نظام إدارة الفواتير الأذكى في المملكة",
	description:
		"أنشئ فواتير احترافية متوافقة مع هيئة الزكاة والضريبة في أقل من دقيقتين. منصة ذكية لإصدار الفواتير الإلكترونية للمستقلين وأصحاب الأعمال.",
	keywords: [
		"فواتير إلكترونية",
		"نظام فواتير",
		"هيئة الزكاة والضريبة",
		"فاتورة",
		"محاسبة",
		"مستقلين",
		"أعمال",
	],
	openGraph: {
		title: "بِلفورا - نظام إدارة الفواتير الأذكى في المملكة",
		description:
			"أنشئ فواتير احترافية متوافقة مع هيئة الزكاة والضريبة في أقل من دقيقتين.",
		type: "website",
		locale: "ar_SA",
	},
};

/**
 * Server component wrapper for the landing page.
 * Metadata is exported for SEO while the interactive parts are client-rendered.
 */
export default function Home() {
	return <LandingPageClient />;
}
