import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/providers/QueryProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Analytics } from "@vercel/analytics/next"

const vazirmatn = Vazirmatn({
	subsets: ["arabic"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-vazirmatn",
	display: "swap",
});

export const metadata: Metadata = {
	title: "بيلفورة",
	description: "فواتير احترافية جذابة وسريعة.",
	icons: {
		icon: [
			{ url: "/symbol-shadowNoBg.png", type: "image/png" },
			{ url: "/favicon.ico", sizes: "any" },
		],
		shortcut: "/favicon.ico",
		apple: "/symbol-shadowNoBg.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ar" dir="rtl" className="scroll-smooth" suppressHydrationWarning>
			<body className={`${vazirmatn.className} font-sans antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<QueryProvider>
						<MotionProvider>
							{children}
							<Toaster />
						</MotionProvider>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
