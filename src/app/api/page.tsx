import Navbar from "@/components/landing-page/Navbar";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { Code2, Terminal, Zap } from "lucide-react";

export default function ApiPage() {
	return (
		<div className="min-h-screen bg-white">
			<Navbar />
			<main className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
				<div className="text-center mb-16">
					<TextAnimate
						as="h1"
						animation="blurIn"
						once={true}
						className="text-4xl font-bold md:text-5xl text-[#012d46] mb-6"
					>
						Bilfora API للمطورين
					</TextAnimate>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						اربط أنظمتك بمنصة بِلفورا بسهولة. قريباً ستتمكن من أتمتة إصدار الفواتير بالكامل.
					</p>
				</div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7f2dfb]">
                            <Zap size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-[#012d46]">سريع وموثوق</h3>
                        <p className="text-gray-500 text-sm">استجابة فائقة السرعة مع توفر 99.9% لضمان استمرارية أعمالك.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Code2 size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-[#012d46]">سهل التكامل</h3>
                        <p className="text-gray-500 text-sm">توثيق شامل SDKs للغات البرمجة الشهيرة لتبدأ في دقائق.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Terminal size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-[#012d46]">بيئة تجريبية</h3>
                        <p className="text-gray-500 text-sm">بيئة Sandbox كاملة لاختبار تطبيقاتك قبل الإطلاق الحي.</p>
                    </div>
                </div>

                <div className="bg-[#0f172a] rounded-2xl p-8 md:p-12 overflow-hidden relative">
                    <div className="relative z-10 text-center">
                         <h2 className="text-2xl font-bold text-white mb-4">
                            قريباً في 2025
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                            نعمل حالياً على بناء أفضل تجربة للمطورين. سجل اهتمامك لتكون أول من يجرب الـ API.
                        </p>
                        <form className="max-w-md mx-auto flex gap-2">
                            <input 
                                type="email" 
                                placeholder="بريدك الإلكتروني" 
                                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#7f2dfb]"
                            />
                            <button className="px-6 py-3 bg-[#7f2dfb] text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
                                إعلامي
                            </button>
                        </form>
                    </div>
                    
                    {/* Abstract Code decoration */}
                    <div className="absolute top-0 right-0 p-8 opacity-10 text-xs font-mono text-green-400 pointer-events-none select-none hidden md:block text-left" dir="ltr">
                        {`POST /v1/invoices HTTP/1.1
Host: api.bilfora.com
Authorization: Bearer sk_test_...
Content-Type: application/json

{
  "customer": "cus_123456",
  "items": [
    {
      "price": "price_123",
      "quantity": 1
    }
  ]
}`}
                    </div>
                </div>
			</main>
		</div>
	);
}

