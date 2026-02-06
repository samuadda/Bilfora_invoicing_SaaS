"use client";
import { Check, Zap } from "lucide-react";
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
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <Text variant="body-small" color="accent" className="font-semibold leading-7">
            الأسعار
          </Text>
          <Heading variant="h2" className="mt-2 sm:text-5xl">
            مجاني بالكامل
          </Heading>
          <Text variant="body-large" color="muted" className="mx-auto mt-6 max-w-2xl leading-8">
            بدون رسوم خفية. بدون بطاقة ائتمان. بدون &ldquo;مجاني لمدة محدودة&rdquo;.
          </Text>
        </div>

        {/* Pricing Card */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-16 max-w-md"
        >
          <Card
            padding="xlarge"
            className="relative ring-2 ring-[#7f2dfb]"
          >
            {/* Badge */}
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1.5 text-sm font-semibold text-white bg-[#7f2dfb] rounded-full">
              الخطة الوحيدة
            </div>

            <div className="text-center pt-2">
              {/* Icon */}
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-purple-50 mb-4">
                <Zap className="h-7 w-7 text-[#7f2dfb]" />
              </div>
              
              {/* Title */}
              <Heading variant="h3" className="text-[#012d46]">
                كل شي مفتوح
              </Heading>
              
              {/* Price */}
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-[#012d46]">0</span>
                <Text variant="body-small" color="muted" className="font-medium">
                  ريال / للأبد
                </Text>
              </div>

              <Text variant="body-small" color="muted" className="mt-3">
                لأني أبني هذا المنتج بحب
              </Text>
            </div>

            {/* CTA */}
            <Link href="/register" className="block mt-6">
              <Button variant="primary" className="w-full py-3">
                ابدأ الآن
              </Button>
            </Link>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <ul role="list" className="space-y-3">
                {features.map((feature, index) => (
                  <m.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                    className="flex gap-x-3"
                  >
                    <Check
                      className="h-5 w-5 flex-none text-[#7f2dfb]"
                      aria-hidden="true"
                    />
                    <Text variant="body-small" color="muted">{feature}</Text>
                  </m.li>
                ))}
              </ul>
            </div>
          </Card>
        </m.div>

        {/* Footer note */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 text-center"
        >
          <Text variant="body-small" color="muted">
            &ldquo;ليش مجاني؟&rdquo; — لأني أبني أداة أتمنى لو كانت موجودة لي
          </Text>
        </m.div>
      </Container>
    </Section>
  );
}
