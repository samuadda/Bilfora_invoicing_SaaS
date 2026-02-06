import Navbar from "@/components/landing-page/Navbar";
import { Search } from "lucide-react";
import { TextAnimate } from "@/components/landing-page/text-animate";

export default function HelpCenterPage() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<TextAnimate
						as="h1"
						animation="blurIn"
						once={true}
						className="text-4xl font-bold md:text-5xl text-[#012d46] mb-6"
					>
						مركز المساعدة
					</TextAnimate>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
						ابحث عن إجابات لأسئلتك أو تصفح المقالات أدناه
					</p>

					<div className="max-w-2xl mx-auto relative">
						<input
							type="text"
							placeholder="ابحث عن مشكلتك..."
							className="w-full px-6 py-4 pr-12 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7f2dfb] text-right"
						/>
						<Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					<div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md transition-shadow">
						<h3 className="text-xl font-bold text-[#012d46] mb-4">
							البدء مع بِلفورا
						</h3>
						<ul className="space-y-3 text-gray-600">
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								كيف أنشئ حساب جديد؟
							</li>
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								إعداد ملفي الشخصي
							</li>
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								جولة في لوحة التحكم
							</li>
						</ul>
					</div>
					<div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md transition-shadow">
						<h3 className="text-xl font-bold text-[#012d46] mb-4">
							الفواتير والمدفوعات
						</h3>
						<ul className="space-y-3 text-gray-600">
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								كيف أنشئ فاتورة جديدة؟
							</li>
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								تخصيص تصميم الفاتورة
							</li>
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								إدارة المدفوعات المستلمة
							</li>
						</ul>
					</div>
					<div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:shadow-md transition-shadow">
						<h3 className="text-xl font-bold text-[#012d46] mb-4">
							إدارة الحساب
						</h3>
						<ul className="space-y-3 text-gray-600">
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								تغيير كلمة المرور
							</li>
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								ترقية الباقة
							</li>
							<li className="hover:text-[#7f2dfb] cursor-pointer">
								حذف الحساب
							</li>
						</ul>
					</div>
				</div>
			</main>
		</div>
	);
}

