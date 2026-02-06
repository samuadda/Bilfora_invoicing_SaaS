"use client";
import { Check, Sparkles, Heart, Rocket, PartyPopper } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Section, Container, Heading, Text, Card, Button } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";

export function Pricing() {
  const features = [
    "عدد غير محدود من العملاء",
    "فواتير غير محدودة",
    "قوالب احترافية متعددة",
    "تصدير PDF بضغطة زر",
    "لوحة تحكم ذكية",
    "تقارير أساسية",
    "دعم فني من شخص حقيقي",
  ];

  return (
    <Section padding="large" id="pricing">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 mb-4"
          >
            <PartyPopper className="h-5 w-5 text-[#7f2dfb]" />
            <Text variant="body-small" className="font-bold text-[#7f2dfb]">
              أخبار سارة!
            </Text>
          </m.div>
          <Heading variant="h2" className="mt-2 sm:text-5xl">
            مجاني. نعم، مجاني بالكامل! 🎉
          </Heading>
        </div>
        <Text variant="body-large" color="muted" className="mx-auto mt-6 max-w-2xl text-center leading-8">
          وقف. بدون صيد. بدون &ldquo;مجاني لـ 7 أيام ثم ندمرك بالفواتير&rdquo;.
          <br />
          <span className="text-[#7f2dfb] font-semibold">مجاني فعلاً — لأني أبني هذا المنتج بحب.</span>
        </Text>

        {/* Single Fun Pricing Card */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-16 max-w-lg"
        >
          <Card
            padding="xlarge"
            className="relative ring-2 ring-[#7f2dfb] overflow-hidden"
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#7f2dfb] via-pink-500 to-orange-400" />
            
            {/* Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#7f2dfb] to-pink-500 rounded-full">
              الخطة الوحيدة ✨
            </div>

            <div className="text-center pt-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-100 mb-4">
                <Rocket className="h-8 w-8 text-[#7f2dfb]" />
              </div>
              
              <Heading variant="h3" className="text-[#7f2dfb]">
                كل شي مفتوح
              </Heading>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-5xl font-extrabold text-gray-900">0</span>
                <div className="text-right">
                  <Text variant="body-small" color="muted" className="font-semibold">ريال</Text>
                  <Text variant="body-xs" color="muted">للأبد 🥳</Text>
                </div>
              </div>

              <Text variant="body-small" color="muted" className="mt-4 leading-relaxed">
                لا بطاقة ائتمان. لا مفاجآت. لا &ldquo;أدخل بياناتك عشان نزعجك لاحقاً&rdquo;.
              </Text>
            </div>

            <Link href="/register" className="block mt-8">
              <Button variant="primary" className="w-full py-4 text-lg font-bold">
                <Heart className="h-5 w-5 ml-2" />
                ابدأ الآن — يالله!
              </Button>
            </Link>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Text variant="body-small" className="font-semibold text-gray-700 mb-4 text-center">
                كل هذا... ببلاش؟ 🤯
              </Text>
              <ul role="list" className={cn("space-y-3")}>
                {features.map((feature, index) => (
                  <m.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-x-3"
                  >
                    <Check
                      className="h-5 w-5 flex-none text-emerald-500"
                      aria-hidden="true"
                    />
                    <Text variant="body-small" color="muted">{feature}</Text>
                  </m.li>
                ))}
              </ul>
            </div>
          </Card>
        </m.div>

        {/* Fun footer note */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className={cn("inline-flex items-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 px-5 py-3 rounded-2xl", layout.gap.tight)}>
            <Sparkles className="h-5 w-5 text-amber-500" />
            <Text variant="body-small" className="text-amber-800 font-medium">
              &ldquo;ليش مجاني؟&rdquo; — لأني أبني أداة أتمنى لو كانت موجودة لي. وأبيك تجربها وتعطيني رأيك! 💬
            </Text>
          </div>
        </m.div>
      </Container>
    </Section>
  );
}
