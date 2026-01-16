"use client";
import { Check, Shield } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Section, Container, Heading, Text, Card, Button } from "@/components/ui";
import { layout } from "@/lib/ui/tokens";

const tiers = [
  {
    name: "مجاني",
    id: "free",
    href: "/register",
    price: { monthly: "0", annually: "0" },
    description: "كل ما تحتاجه للبدء في إصدار الفواتير.",
    features: [
      "عدد غير محدود من العملاء",
      "5 فواتير شهرياً",
      "قوالب فواتير أساسية",
      "تصدير PDF",
      "لوحة تحكم بسيطة",
    ],
    mostPopular: false,
  },
  {
    name: "احترافي",
    id: "pro",
    href: "/register?plan=pro",
    price: { monthly: "29", annually: "290" },
    description: "للمستقلين والشركات الصغيرة التي تنمو بسرعة.",
    features: [
      "فواتير غير محدودة",
      "قوالب احترافية مخصصة",
      "إزالة شعار بيلفورا",
      "تعدد العملات",
      "تقارير متقدمة",
      "دعم فني ذو أولوية",
    ],
    mostPopular: true,
  },
  {
    name: "مؤسسات",
    id: "enterprise",
    href: "/contact",
    price: { monthly: "99", annually: "990" },
    description: "حلول مخصصة للشركات الكبيرة والفرق.",
    features: [
      "كل مميزات الباقة الاحترافية",
      "وصول متعدد للمستخدمين (قريباً)",
      "ربط API (قريباً)",
      "مدير حساب مخصص",
      "تخصيص كامل للهوية",
    ],
    mostPopular: false,
  },
];

export function Pricing() {
  return (
    <Section padding="large" id="pricing">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <Text variant="body-small" color="accent" className="font-semibold leading-7">
            الأسعار
          </Text>
          <Heading variant="h2" className="mt-2 sm:text-5xl">
            اختر الخطة المناسبة لعملك
          </Heading>
        </div>
        <Text variant="body-large" color="muted" className="mx-auto mt-6 max-w-2xl text-center leading-8">
          ابدأ مجاناً. ادفع فقط عندما تنمو أعمالك.
        </Text>
        <Text variant="body-small" color="muted" className="mx-auto mt-2 max-w-2xl text-center leading-8">
          معظم عملائنا يبدأون بالمجان ويرتقون بعد 3 أشهر
        </Text>
        <div className={cn("isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3", layout.gap.large)}>
          {tiers.map((tier, tierIdx) => (
            <m.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: tierIdx * 0.1 }}
            >
              <Card
                padding="xlarge"
                className={cn(
                  tier.mostPopular ? "ring-2 ring-brand-primary" : "ring-1 ring-gray-200",
                  "relative"
                )}
              >
                {tier.mostPopular ? (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-semibold text-white bg-brand-primary rounded-full">
                    الأكثر اختياراً - 70% من العملاء
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-x-4">
                  <Heading
                    variant="h4"
                    id={tier.id}
                    className={cn(
                      tier.mostPopular ? "text-brand-primary" : "text-gray-900"
                    )}
                  >
                    {tier.name}
                  </Heading>
                </div>
                <Text variant="body-small" color="muted" className="mt-4 leading-6">
                  {tier.description}
                </Text>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {tier.price.monthly}
                  </span>
                  <Text variant="body-small" color="muted" className="font-semibold leading-6">
                    ريال / شهرياً
                  </Text>
                </p>
                <Link
                  href={tier.href}
                  aria-describedby={tier.id}
                >
                  <Button
                    variant={tier.mostPopular ? "primary" : "secondary"}
                    className={cn(
                      "mt-6 w-full",
                      !tier.mostPopular && "text-brand-primary ring-1 ring-inset ring-brand-primary hover:ring-brand-primaryHover hover:bg-brand-primary/5"
                    )}
                  >
                    {tier.id === 'free' ? 'ابدأ مجانًا' : 'اشترك الآن'}
                  </Button>
                </Link>
                <ul
                  role="list"
                  className={cn("mt-8", layout.stack.standard)}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-brand-primary"
                        aria-hidden="true"
                      />
                      <Text variant="body-small" color="muted">{feature}</Text>
                    </li>
                  ))}
                </ul>
              </Card>
            </m.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className={cn("inline-flex items-center bg-gray-50 px-4 py-2 rounded-xl", layout.gap.tight)}>
            <Shield className="h-4 w-4 text-green-500" />
            <Text variant="body-small" color="muted">ضمان استرداد الأموال خلال 30 يوم - أو استرجع أموالك</Text>
          </div>
        </div>
      </Container>
    </Section>
  );
}

