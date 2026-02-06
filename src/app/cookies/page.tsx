import Navbar from "@/components/landing-page/Navbar";

export default function CookiesPage() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold mb-8 text-[#012d46]">
					سياسة ملفات تعريف الارتباط (Cookies)
				</h1>
				<div className="space-y-6 text-gray-600 leading-relaxed">
					<p>
						نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربتك في تصفح موقع بِلفورا.
					</p>

					<h2 className="text-2xl font-semibold text-[#012d46]">
						ما هي ملفات تعريف الارتباط؟
					</h2>
					<p>
						هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة الموقع. تساعدنا هذه الملفات في تذكر تفضيلاتك وفهم كيفية استخدامك للموقع.
					</p>

					<h2 className="text-2xl font-semibold text-[#012d46]">
						كيف نستخدمها؟
					</h2>
					<ul className="list-disc list-inside space-y-2 mr-4">
                        <li>للحفاظ على جلسة تسجيل الدخول الخاصة بك نشطة.</li>
                        <li>لتذكر تفضيلات اللغة وإعدادات العرض.</li>
                        <li>لتحليل أداء الموقع وتحسينه.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-[#012d46]">
                        إدارة ملفات تعريف الارتباط
                    </h2>
                    <p>
                        يمكنك التحكم في ملفات تعريف الارتباط أو حذفها من خلال إعدادات المتصفح الخاص بك. يرجى ملاحظة أن تعطيل بعض الملفات قد يؤثر على عمل بعض ميزات الموقع.
                    </p>
				</div>
			</main>
		</div>
	);
}

