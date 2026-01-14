"use client";

import Image from "next/image";
import Link from "next/link";
import MainButton from "@/components/MainButton";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { NavigationMenu } from "@/components/landing-page/MobileMenu";

const NavItems = [
	{ name: "الرئيسية", href: "/#home" },
	{ name: "المميزات", href: "/#features" },
	{ name: "كيف يعمل", href: "/#how-to" },
	{ name: "الأسعار", href: "/#pricing" },
	{ name: "من نحن", href: "/about" },
	{ name: "الأسئلة الشائعة", href: "/#faq" },
];

const Navbar = () => {
	// Note: usePathname won't detect hash changes, but we use it for other logic if needed.
	// For a landing page with hash links, active state is usually handled by scroll observers (not implemented here for simplicity, or we can add it later).

	return (
		<>
			<motion.nav
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-gray-100 transition-all"
			>
				<div className="navbar-start flex items-center">
					{/* logo */}
					<Link href="/">
						<Image
							src="/logoPNG.png"
							alt="Bilfora"
							width={120}
							height={40}
							className="h-8 w-auto hover:opacity-80 transition-opacity"
						/>
					</Link>
				</div>

				<div className="navbar-center hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<ul className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
						{NavItems.map((item) => (
							<li key={item.name}>
								<Link
									href={item.href}
									className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded-full transition-all duration-200"
								>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div className="navbar-end flex items-center gap-4">
					<Link
						href="/login"
						className="hidden items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors lg:flex"
					>
						<span>تسجيل الدخول</span>
						<ChevronLeft size={16} />
					</Link>
					<Link href="/register">
						<MainButton
							text="جرب مجاناً"
							bgColor="bg-brand-primary"
							textColor="text-white"
							className="hidden md:flex px-6 py-2 h-auto text-sm shadow-purple-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
						/>
					</Link>
				</div>
			</motion.nav>
			<NavigationMenu NavItems={NavItems} MainButtonText="جرب مجاناً" />
		</>
	);
};

export default Navbar;
