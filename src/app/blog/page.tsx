import Navbar from "@/components/landing-page/Navbar";
import { TextAnimate } from "@/components/landing-page/text-animate";

export default function BlogPage() {
    const posts = [
        {
            title: "كيف تدير فواتيرك بذكاء؟",
            excerpt: "نصائح عملية للمستقلين لتنظيم الدخل والمصروفات وتجنب الفوضى المالية.",
            date: "27 نوفمبر 2025",
            category: "نصائح مالية"
        },
        {
            title: "أهمية الفاتورة الإلكترونية في السعودية",
            excerpt: "كل ما تحتاج معرفته عن متطلبات هيئة الزكاة والضريبة والجمارك (فاتورة).",
            date: "25 نوفمبر 2025",
            category: "تحديثات قانونية"
        },
        {
            title: "5 أدوات لا غنى عنها لأي مستقل",
            excerpt: "قائمة بأفضل الأدوات التي ستساعدك على زيادة إنتاجيتك وتنظيم عملك.",
            date: "20 نوفمبر 2025",
            category: "أدوات وإنتاجية"
        }
    ];

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
						مدونة بِلفورا
					</TextAnimate>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						أحدث المقالات والنصائح للمستقلين وأصحاب الأعمال
					</p>
				</div>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <article key={index} className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="h-48 bg-gray-200 w-full animate-pulse">
                                {/* Placeholder for blog image */}
                                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-gray-400">
                                    صورة المقال
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-xs font-semibold text-[#7f2dfb] mb-2">{post.category}</div>
                                <h3 className="text-xl font-bold text-[#012d46] mb-3 hover:text-[#7f2dfb] transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="text-gray-400 text-xs mt-auto pt-4 border-t border-gray-100">
                                    {post.date}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
			</main>
		</div>
	);
}

