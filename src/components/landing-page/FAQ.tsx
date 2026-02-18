"use client";
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { TextAnimate } from "@/components/landing-page/text-animate";
import { ChevronDown, HelpCircle, Shield, FileText, CreditCard, Lock, Download, WifiOff } from "lucide-react";
import Link from "next/link";
import { Section, Container, Text, Button } from "@/components/ui";

const faqs = [
  {
    question: "هل بِلفورا مجاني؟",
    answer:
      "نعم، توجد خطة مجانية تتيح لك إنشاء 5 فواتير شهرياً، وهي مثالية للمستقلين في بداية مشوارهم. يمكنك الترقية في أي وقت عندما تحتاج إلى المزيد من الفواتير.",
    icon: HelpCircle,
  },
  {
    question: "هل الفواتير رسمية؟",
    answer:
      "نعم، الفواتير الصادرة من بِلفورا مصممة لتكون احترافية وتشمل جميع البيانات الأساسية المتعارف عليها تجارياً، وتصلح للاستخدام الرسمي.",
    icon: Shield,
  },
  {
    question: "هل يمكنني تخصيص شكل الفاتورة؟",
    answer:
      "بالتأكيد! يمكنك إضافة شعارك، تغيير الألوان، وتعديل بعض النصوص لتناسب هوية علامتك التجارية. في الباقة الاحترافية، يمكنك إزالة شعار بِلفورا تماماً.",
    icon: FileText,
  },
  {
    question: "كيف يمكنني استلام أموالي؟",
    answer:
      "بِلفورا يساعدك في إصدار الفاتورة وإرسالها للعميل. الدفع يتم بينك وبين المشتري مباشرة عبر وسائل الدفع التي تحددها في الفاتورة (تحويل بنكي، STC Pay، Apple Pay، إلخ). يمكنك أيضاً إضافة رابط دفع في الفاتورة.",
    icon: CreditCard,
  },
  {
    question: "هل بياناتي آمنة؟",
    answer:
      "نحن نأخذ أمان بياناتك بجدية تامة. جميع البيانات مشفرة باستخدام SSL ومحفوظة في خوادم آمنة مع نسخ احتياطية يومية. لا نشارك بياناتك مع أي طرف ثالث أبداً.",
    icon: Lock,
  },
  {
    question: "ماذا لو أردت التوقف عن الاستخدام؟",
    answer:
      "يمكنك تصدير جميع بياناتك (العملاء، الفواتير، الخدمات) في أي وقت بصيغة Excel أو PDF. لا نقفل حسابك أبداً - يمكنك العودة في أي وقت.",
    icon: Download,
  },
  {
    question: "هل يمكنني استخدامه بدون إنترنت؟",
    answer:
      "نعم، بِلفورا يعمل في وضع عدم الاتصال. يمكنك إنشاء الفواتير وتعديلها حتى بدون اتصال بالإنترنت، وسيتم مزامنة البيانات تلقائياً عند عودة الاتصال.",
    icon: WifiOff,
  },
];

const AccordionItem = ({
  question,
  answer,
  isOpen,
  onClick,
  icon: Icon,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex w-full items-center justify-between py-6 text-right text-lg font-medium transition-colors hover:text-brand-primary"
        onClick={onClick}
      >
        <div className="flex items-center gap-3 flex-1">
          <Icon className="h-5 w-5 text-brand-primary flex-shrink-0" />
          <span className="text-right">{question}</span>
        </div>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mr-2"
        >
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </m.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Text variant="body" color="muted" className="pb-6 leading-relaxed pr-8">{answer}</Text>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section padding="large" className="max-w-4xl mx-auto" id="faq">
      <Container>
        <div className="text-center mb-16">
          <TextAnimate
            as="h2"
            animation="blurIn"
            once={true}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            الأسئلة الشائعة
          </TextAnimate>
          <Text variant="body-large" color="muted" className="mt-4 leading-8">
            إجابات على الأسئلة التي قد تدور في ذهنك
          </Text>
        </div>

        <div className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              icon={faq.icon}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Text variant="body-large" className="mb-4 font-medium">لا تزال لديك أسئلة؟</Text>
          <Link href="/contact">
            <Button variant="primary" size="md" className="px-6">
              تواصل معنا - نرد خلال ساعة
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
