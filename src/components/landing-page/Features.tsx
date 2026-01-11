"use client";
import { motion } from "framer-motion";
import MainButton from "@/components/MainButton";
import { TextAnimate } from "@/components/landing-page/text-animate";
import {
    Laptop,
    Smartphone,
    Palette,
    Zap,
    Layout,
    CheckCircle2,
    FileText,
    CreditCard,
    Shield
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Section, Container, Heading, Text, Button } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";

export const Features = () => {
    return (
        <Section className="mt-20" id="features">
            <Container>
                <div className={cn("mb-12 flex flex-col items-center text-center", layout.gap.standard)}>
                    <TextAnimate
                        as="h2"
                        animation="blurIn"
                        once={true}
                        className="max-w-2xl text-4xl font-bold md:text-5xl lg:text-6xl text-brand-dark leading-tight"
                    >
                        كل ما تحتاجه لإدارة فواتيرك باحترافية
                    </TextAnimate>
                    <Text variant="body-large" color="muted" className="max-w-xl">
                        أدوات قوية مصممة خصيصاً للمستقلين والشركات الصغيرة لتسهيل الأعمال المالية
                    </Text>
                </div>

                <div className={cn("grid grid-cols-12", layout.gap.large)}>
                    {/* Feature 1: VAT Compliance - Primary Feature */}
                    <BounceCard className="col-span-12 md:col-span-6 bg-gradient-to-br from-green-50 to-emerald-50 border-none">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Shield className="h-6 w-6 text-green-600" />
                            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">معتمد</span>
                        </div>
                        <CardTitle>متوافق 100% مع هيئة الزكاة والضريبة</CardTitle>
                        <p className="text-gray-600 mt-3 text-center text-sm relative z-10">
                            لا تقلق من الأخطاء. جميع الفواتير تلتزم بالمتطلبات السعودية تلقائياً.
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-12 transition-transform duration-500 group-hover:translate-y-4">
                            <div className="relative">
                                <Shield className="w-32 h-32 text-green-500 opacity-20" strokeWidth={1.5} />
                            </div>
                        </div>
                    </BounceCard>

                    {/* Feature 2: Mobile & Desktop */}
                    <BounceCard className="col-span-12 md:col-span-6 bg-gradient-to-br from-violet-100 to-indigo-100 border-none">
                        <CardTitle>أنشئ فاتورة من أي مكان</CardTitle>
                        <p className="text-gray-600 mt-3 text-center text-sm relative z-10">
                            مكتبك، مقهى، أو حتى من سيارتك - كل الأجهزة متاحة
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-12 transition-transform duration-500 group-hover:translate-y-4">
                            <div className="relative">
                                <Smartphone className="w-24 h-48 text-slate-800 absolute -right-6 bottom-0 z-10 fill-white" strokeWidth={1.5} />
                                <Laptop className="w-48 h-32 text-slate-800 relative z-0 fill-white" strokeWidth={1.5} />
                            </div>
                        </div>
                    </BounceCard>

                    {/* Feature 3: Design & Customization */}
                    <BounceCard className="col-span-12 md:col-span-8 bg-gradient-to-br from-amber-50 to-orange-50 border-none">
                        <CardTitle>فواتير تجعل عملك يبدو احترافياً</CardTitle>
                        <p className="text-gray-600 mt-3 text-center text-sm relative z-10">
                            أضف شعارك وألوان علامتك التجارية - قوالب عربية جاهزة
                        </p>
                        <div className="absolute bottom-0 left-4 right-4 top-32 translate-y-12 rounded-t-2xl bg-white shadow-2xl p-6 transition-transform duration-500 group-hover:translate-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Palette className="text-orange-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-32 bg-slate-100 rounded"></div>
                                    <div className="h-2 w-20 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-slate-50 rounded"></div>
                                <div className="h-2 w-full bg-slate-50 rounded"></div>
                                <div className="h-2 w-3/4 bg-slate-50 rounded"></div>
                            </div>
                        </div>
                    </BounceCard>

                    {/* Feature 4: Clean UI */}
                    <BounceCard className="col-span-12 md:col-span-4 bg-gradient-to-br from-emerald-50 to-green-50 border-none">
                        <CardTitle>وفر 5 ساعات أسبوعياً</CardTitle>
                        <p className="text-gray-600 mt-3 text-center text-sm relative z-10">
                            ركز على عملك بدلاً من الفواتير - واجهة بسيطة وسريعة
                        </p>
                        <div className="absolute bottom-0 right-10 top-24 w-full translate-x-12 rounded-tl-2xl bg-white shadow-xl p-6 transition-transform duration-500 group-hover:translate-x-8 border border-slate-100">
                            <div className="flex gap-4">
                                <div className="w-1/4 space-y-3 pt-4">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Layout className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                </div>
                                <div className="w-3/4 bg-slate-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                        <div className="h-8 w-20 bg-emerald-500 rounded-md"></div>
                                    </div>
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex justify-between p-2 bg-white rounded border border-slate-100">
                                                <div className="h-2 w-12 bg-slate-100 rounded"></div>
                                                <div className="h-2 w-8 bg-slate-100 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </BounceCard>

                    {/* Feature 5: For Freelancers */}
                    <BounceCard className="col-span-12 md:col-span-4 bg-gradient-to-br from-pink-50 to-rose-50 border-none">
                        <CardTitle>احفظ عملائك وخدماتك مرة واحدة</CardTitle>
                        <p className="text-gray-600 mt-3 text-center text-sm relative z-10">
                            استخدمها في كل فاتورة بدون إعادة كتابة - قاعدة بيانات ذكية
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 top-32 flex flex-col items-center justify-start pt-8 transition-transform duration-500 group-hover:-translate-y-2">
                            <div className="relative">
                                <div className="absolute -left-12 top-0 bg-white p-3 rounded-xl shadow-lg transform -rotate-12 z-10">
                                    <Zap className="text-yellow-500 w-6 h-6" />
                                </div>
                                <div className="absolute -right-12 top-10 bg-white p-3 rounded-xl shadow-lg transform rotate-12 z-10">
                                    <CreditCard className="text-pink-500 w-6 h-6" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-xl z-20 relative">
                                    <FileText className="text-slate-700 w-12 h-12" />
                                </div>
                            </div>
                        </div>
                    </BounceCard>
                </div>

                <div className="mt-12 flex justify-center">
                    <Link href="/register">
                        <Button variant="primary" size="lg" className="px-8">
                            ابدأ مجاناً - بدون بطاقة ائتمان
                        </Button>
                    </Link>
                </div>
            </Container>
        </Section>
    );
};

const BounceCard = ({ className, children }: { className?: string, children: React.ReactNode }) => {
    return (
        <motion.div
            whileHover={{ scale: 0.98 }}
            className={cn("group relative min-h-[300px] cursor-pointer overflow-hidden rounded-3xl p-8 shadow-sm hover:shadow-md transition-all", className)}
        >
            {children}
        </motion.div>
    );
};

const CardTitle = ({ children }: { children: React.ReactNode }) => {
    return <h3 className="mx-auto text-center text-2xl font-bold text-slate-800 relative z-10">{children}</h3>;
};
